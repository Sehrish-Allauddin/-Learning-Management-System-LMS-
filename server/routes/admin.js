const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { verifyToken, isAdmin, isModeratorOrAdmin } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// GET /api/admin/users
// Supports filtering by name, erpId, region
router.get('/users', verifyToken, isModeratorOrAdmin, async (req, res) => {
  try {
    const { name, erpId, region } = req.query;

    const where = {};
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (erpId) {
      where.erpId = { contains: erpId };
    }
    if (region) {
      where.region = region;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        erpId: true,
        designation: true,
        region: true,
        role: true,
        createdAt: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/users/bulk
// Admin only. Imports multiple users.
router.post('/users/bulk', verifyToken, isAdmin, async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty users array' });
    }

    // Default password for bulk imported users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('LMS@123', salt);

    const validUsers = users.filter(u => 
      u.name && u.erpId && /^\d{6}$/.test(u.erpId) && u.designation
    ).map(u => ({
      name: u.name,
      erpId: u.erpId,
      designation: u.designation,
      region: u.region || null,
      role: 'USER',
      passwordHash
    }));

    if (validUsers.length === 0) {
      return res.status(400).json({ error: 'No valid users to import. Check format.' });
    }

    const result = await prisma.user.createMany({
      data: validUsers,
      skipDuplicates: true // Skip if ERP ID already exists
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'BULK_IMPORT_USERS',
        details: `Imported ${result.count} users successfully.`
      }
    });

    res.json({ message: `Successfully imported ${result.count} users`, count: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// PUT /api/admin/users/:id/role
// Only main admins can assign roles to moderators or users
router.put('/users/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'REGIONAL_ADMIN', 'MODERATOR', 'USER'].includes(role))  {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role },
      select: { id: true, name: true, role: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_USER_ROLE',
        details: `Changed role of user ${updatedUser.name} to ${role}`
      }
    });

    res.json({ message: 'User role updated', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id
// Admin only. Deletes a user and their associated data.
router.delete('/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Don't allow admins to delete themselves
    if (req.user.id === userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: { _count: { select: { createdCourses: true } } }
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Protect course creators from deletion for data integrity
    if (userToDelete._count.createdCourses > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user because they have created courses. Please reassign or delete the courses first.' 
      });
    }

    // Delete associated records first
    await prisma.$transaction([
      prisma.progress.deleteMany({ where: { userId } }),
      prisma.reward.deleteMany({ where: { userId } }),
      prisma.feedback.deleteMany({ where: { userId } }),
      prisma.comment.deleteMany({ where: { userId } }),
      prisma.discussion.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_USER',
        details: `Deleted user ${userToDelete.name} (${userToDelete.erpId})`
      }
    });

    res.json({ message: 'User successfully deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET /api/admin/reports/missing-assessments
// Report of how many people did the course but did not give the assessment.
router.get('/reports/missing-assessments', verifyToken, isModeratorOrAdmin, async (req, res) => {
  try {
    // A missing assessment means a user has COMPLETED all non-assessment modules of a course
    // but the final POST_ASSESSMENT is not COMPLETED.
    // We will do this efficiently:
    
    // Find all users and their progress for POST_ASSESSMENT modules
    const postAssessmentModules = await prisma.module.findMany({
      where: { type: 'POST_ASSESSMENT' }
    });

    const postAssModuleIds = postAssessmentModules.map(m => m.id);

    if (postAssModuleIds.length === 0) {
      return res.json([]);
    }

    const missingProgresses = await prisma.progress.findMany({
      where: {
        moduleId: { in: postAssModuleIds },
        status: { not: 'COMPLETED' } // they have the module locked or in progress
      },
      include: {
        user: { select: { id: true, name: true, erpId: true } },
        module: { select: { id: true, title: true, course: { select: { id: true, title: true } } } }
      }
    });

    res.json(missingProgresses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/reports/missing-assessments
// Shows users who completed all normal course modules
// but have NOT completed the final POST_ASSESSMENT.
router.get(
  '/reports/missing-assessments',
  verifyToken,
  isModeratorOrAdmin,
  async (req, res) => {
    try {
      // --------------------------------------------------
      // Get all courses with their modules
      // --------------------------------------------------
      const courses = await prisma.course.findMany({
        include: {
          modules: {
            orderBy: {
              sequenceOrder: 'asc'
            }
          }
        }
      });

      // --------------------------------------------------
      // Get all users
      // --------------------------------------------------
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          erpId: true,
          designation: true,
          region: true
        }
      });

      // --------------------------------------------------
      // Get all progress records
      // --------------------------------------------------
      const allProgress = await prisma.progress.findMany({
        select: {
          id: true,
          userId: true,
          moduleId: true,
          status: true,
          score: true,
          updatedAt: true
        }
      });

      const reports = [];

      // --------------------------------------------------
      // Check every user against every course
      // --------------------------------------------------
      for (const user of users) {
        const userProgress = allProgress.filter(
          (p) => p.userId === user.id
        );

        for (const course of courses) {
          const modules = course.modules || [];

          if (modules.length === 0) {
            continue;
          }

          // ----------------------------------------------
          // Find final assessment
          // ----------------------------------------------
          const assessmentModule = modules.find(
            (module) => module.type === 'POST_ASSESSMENT'
          );

          // Course without final assessment
          if (!assessmentModule) {
            continue;
          }

          // ----------------------------------------------
          // Normal modules = everything before final
          // assessment
          // ----------------------------------------------
          const normalModules = modules.filter(
            (module) =>
              module.type !== 'POST_ASSESSMENT'
          );

          if (normalModules.length === 0) {
            continue;
          }

          // ----------------------------------------------
          // Check whether all normal modules are completed
          // ----------------------------------------------
          const completedNormalModules =
            normalModules.every((module) => {
              const progress = userProgress.find(
                (p) => p.moduleId === module.id
              );

              return (
                progress &&
                progress.status === 'COMPLETED'
              );
            });

          // User has not completed all course modules
          if (!completedNormalModules) {
            continue;
          }

          // ----------------------------------------------
          // Check final assessment
          // ----------------------------------------------
          const assessmentProgress =
            userProgress.find(
              (p) => p.moduleId === assessmentModule.id
            );

          const assessmentCompleted =
            assessmentProgress &&
            assessmentProgress.status === 'COMPLETED';

          // Assessment already completed -> don't report
          if (assessmentCompleted) {
            continue;
          }

          // ----------------------------------------------
          // Find when normal modules were completed
          // ----------------------------------------------
          const completedDates = normalModules
            .map((module) => {
              const progress = userProgress.find(
                (p) => p.moduleId === module.id
              );

              return progress?.updatedAt
                ? new Date(progress.updatedAt)
                : null;
            })
            .filter(Boolean);

          const completedOn =
            completedDates.length > 0
              ? new Date(
                  Math.max(
                    ...completedDates.map((d) => d.getTime())
                  )
                )
              : null;

          // ----------------------------------------------
          // Add report row
          // ----------------------------------------------
          reports.push({
            user: {
              id: user.id,
              name: user.name,
              erpId: user.erpId,
              designation: user.designation,
              region: user.region
            },

            course: {
              id: course.id,
              title: course.title
            },

            module: {
              id: assessmentModule.id,
              title: assessmentModule.title,
              type: assessmentModule.type
            },

            completedOn,

            assessmentStatus:
              assessmentProgress?.status || 'NOT_STARTED',

            assessmentScore:
              assessmentProgress?.score ?? null
          });
        }
      }

      // --------------------------------------------------
      // Sort newest completed courses first
      // --------------------------------------------------
      reports.sort((a, b) => {
        const dateA = a.completedOn
          ? new Date(a.completedOn).getTime()
          : 0;

        const dateB = b.completedOn
          ? new Date(b.completedOn).getTime()
          : 0;

        return dateB - dateA;
      });

      console.log(
        `Missing assessments report: ${reports.length} records`
      );

      res.json(reports);
    } catch (error) {
      console.error(
        'Missing assessments report error:',
        error
      );

      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    }
  }
);

// GET /api/admin/audit-logs
// Admin only. Gets the system audit logs.
router.get('/audit-logs', verifyToken, isAdmin, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, erpId: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to latest 100 logs
    });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// ==================================================
// MISSING ASSESSMENTS REPORT
// ==================================================
// Shows employees who completed ALL non-assessment modules
// of a course but have not completed the final assessment.

router.get(
  '/reports/missing-assessments',
  verifyToken,
  isModeratorOrAdmin,
  async (req, res) => {
    try {
      const [users, courses] = await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            erpId: true,
            region: true
          }
        }),

        prisma.course.findMany({
          select: {
            id: true,
            title: true,
            modules: {
              orderBy: {
                sequenceOrder: 'asc'
              },
              select: {
                id: true,
                title: true,
                sequenceOrder: true,
                type: true
              }
            }
          }
        })
      ]);

      const results = [];

      // Check every employee against every course
      for (const user of users) {
        const userProgress = await prisma.progress.findMany({
          where: {
            userId: user.id
          },
          select: {
            moduleId: true,
            status: true,
            updatedAt: true
          }
        });

        const progressMap = new Map(
          userProgress.map((p) => [p.moduleId, p])
        );

        for (const course of courses) {
          const normalModules = course.modules.filter(
            (module) => module.type !== 'POST_ASSESSMENT'
          );

          const assessmentModules = course.modules.filter(
            (module) => module.type === 'POST_ASSESSMENT'
          );

          // Course must have a final assessment
          if (assessmentModules.length === 0) {
            continue;
          }

          // Must have at least one normal learning module
          if (normalModules.length === 0) {
            continue;
          }

          // Check whether ALL normal modules are completed
          const allLearningModulesCompleted = normalModules.every(
            (module) => {
              const progress = progressMap.get(module.id);

              return (
                progress &&
                progress.status === 'COMPLETED'
              );
            }
          );

          if (!allLearningModulesCompleted) {
            continue;
          }

          // Check final assessment
          const assessmentProgress = assessmentModules.map(
            (module) => ({
              module,
              progress: progressMap.get(module.id)
            })
          );

          const assessmentCompleted = assessmentProgress.some(
            ({ progress }) =>
              progress &&
              progress.status === 'COMPLETED'
          );

          // If assessment is completed, don't show in report
          if (assessmentCompleted) {
            continue;
          }

          // Find when the employee completed the learning modules
          const completedDates = normalModules
            .map((module) => progressMap.get(module.id))
            .filter(Boolean)
            .map((progress) => progress.updatedAt);

          const completedOn =
            completedDates.length > 0
              ? new Date(
                  Math.max(
                    ...completedDates.map((date) =>
                      new Date(date).getTime()
                    )
                  )
                )
              : null;

          // Find the first incomplete assessment
          const missingAssessment =
            assessmentProgress.find(
              ({ progress }) =>
                !progress ||
                progress.status !== 'COMPLETED'
            );

          results.push({
            user: {
              id: user.id,
              name: user.name,
              erpId: user.erpId,
              region: user.region
            },

            course: {
              id: course.id,
              title: course.title
            },

            module: missingAssessment?.module
              ? {
                  id: missingAssessment.module.id,
                  title: missingAssessment.module.title
                }
              : null,

            completedOn
          });
        }
      }

      console.log(
        `Missing assessments found: ${results.length}`
      );

      res.json(results);

    } catch (error) {
      console.error(
        'Missing assessments report error:',
        error
      );

      res.status(500).json({
        error: 'Failed to generate missing assessments report'
      });
    }
  }
);
// GET /api/admin/analytics
router.get('/analytics', verifyToken, isModeratorOrAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalCertificates,
      rawRegionData,
      rawProgressData
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.reward.count({
        where: { rewardType: 'CERTIFICATE' }
      }),
      prisma.user.groupBy({
        by: ['region'],
        _count: { id: true }
      }),
      prisma.progress.groupBy({
        by: ['status'],
        _count: { id: true }
      })
    ]);

    const usersByRegion = rawRegionData.map(item => ({
      name: item.region || 'Unknown',
      value: item._count.id
    }));

    const progressMap = {
      LOCKED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0
    };

    rawProgressData.forEach(item => {
      progressMap[item.status] = item._count.id;
    });

    const totalProgressEntries =
      Object.values(progressMap).reduce((a, b) => a + b, 0);

    const completionRate =
      totalProgressEntries === 0
        ? 0
        : Math.round(
            (progressMap.COMPLETED / totalProgressEntries) * 100
          );

    res.json({
      overview: {
        totalUsers,
        totalCourses,
        totalCertificates,
        completionRate
      },
      charts: {
        usersByRegion,
        progressStats: [
          { name: 'Locked', count: progressMap.LOCKED },
          { name: 'In Progress', count: progressMap.IN_PROGRESS },
          { name: 'Completed', count: progressMap.COMPLETED }
        ]
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});
module.exports = router;
