const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { verifyToken, isAdmin, isModeratorOrAdmin } = require('../middleware/auth');

// GET /api/learning-paths
// Public/Learner view of all learning paths
router.get('/', verifyToken, async (req, res) => {
  try {
    const paths = await prisma.learningPath.findMany({
      include: {
        courses: {
          orderBy: { sequenceOrder: 'asc' },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                timeLimitMins: true,
                stage: true,
                _count: { select: { modules: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(paths);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/learning-paths
// Admin creates a learning path
router.post('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, description, courseIds } = req.body;
    
    if (!title || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ error: 'Title and at least one course are required' });
    }

    const learningPath = await prisma.learningPath.create({
      data: {
        title,
        description,
        courses: {
          create: courseIds.map((courseId, index) => ({
            courseId,
            sequenceOrder: index + 1
          }))
        }
      },
      include: { courses: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_LEARNING_PATH',
        details: `Created path "${title}" with ${courseIds.length} courses`
      }
    });

    res.status(201).json({ message: 'Learning path created successfully', learningPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
