const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { verifyToken, isModeratorOrAdmin } = require('../middleware/auth');

// POST /api/modules
// Add a new module to a course
router.post('/', verifyToken, isModeratorOrAdmin, async (req, res) => {
  try {
    const { courseId, title, contentUrl, sequenceOrder, type, timeLimitMins, passingScore, questions } = req.body;

    const module = await prisma.module.create({
      data: {
        courseId: parseInt(courseId),
        title,
        contentUrl,
        sequenceOrder: parseInt(sequenceOrder),
        type,
        timeLimitMins: timeLimitMins ? parseInt(timeLimitMins) : null,
        passingScore: passingScore ? parseInt(passingScore) : null,
        questions: questions && questions.length > 0 ? {
          create: questions.map(q => ({
            questionText: q.questionText,
            optionsJson: JSON.stringify(q.options),
            correctOption: q.correctOption
          }))
        } : undefined
      },
      include: {
        questions: true
      }
    });

    res.status(201).json({ message: 'Module added', module });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/modules/:id/complete
// User marks a module as complete
router.post('/:id/complete', verifyToken, async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id);
    const userId = req.user.id;

    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Check if it's an assessment. If so, they must use the submit API, not this one.
    if (module.type.includes('ASSESSMENT')) {
      return res.status(400).json({ error: 'Please submit assessment to complete this module' });
    }

    // Ensure previous module is completed before completing this one (unless it's sequenceOrder 1)
    if (module.sequenceOrder > 1) {
      const prevModule = await prisma.module.findFirst({
        where: { courseId: module.courseId, sequenceOrder: module.sequenceOrder - 1 }
      });

      if (prevModule) {
        const prevProgress = await prisma.progress.findUnique({
          where: { userId_moduleId: { userId, moduleId: prevModule.id } }
        });

        if (!prevProgress || prevProgress.status !== 'COMPLETED') {
          return res.status(403).json({ error: 'Previous module must be completed first' });
        }
      }
    }

    // Upsert progress to COMPLETED
    const progress = await prisma.progress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: { status: 'COMPLETED' },
      create: { userId, moduleId, status: 'COMPLETED' }
    });

    // Automatically issue a badge if applicable (handled in separate logic, but simple here)
    await prisma.reward.create({
      data: {
        userId,
        courseId: module.courseId,
        moduleId: module.id,
        rewardType: 'BADGE'
      }
    });

    // Check if this was the last module in the course to issue certificate
    const allModules = await prisma.module.findMany({
      where: { courseId: module.courseId }
    });
    
    const allProgresses = await prisma.progress.findMany({
      where: { userId, moduleId: { in: allModules.map(m => m.id) } }
    });

    const completedCount = allProgresses.filter(p => p.status === 'COMPLETED').length;
    let certificateIssued = false;

    if (completedCount === allModules.length) {
      // Course is 100% completed, issue certificate
      await prisma.reward.create({
        data: {
          userId,
          courseId: module.courseId,
          rewardType: 'CERTIFICATE'
        }
      });
      certificateIssued = true;
    }

    res.json({ message: 'Module marked as complete', progress, certificateIssued });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/modules/:id
router.delete('/:id', verifyToken, isModeratorOrAdmin, async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id);

    // Delete related questions, progress, and rewards first (no cascade delete in schema)
    await prisma.question.deleteMany({ where: { moduleId } });
    await prisma.progress.deleteMany({ where: { moduleId } });
    await prisma.reward.deleteMany({ where: { moduleId } });

    // Delete module
    await prisma.module.delete({ where: { id: moduleId } });

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
