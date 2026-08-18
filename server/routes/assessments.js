const express = require('express');
const router = express.Router();

const prisma = require('../utils/prisma');
const { verifyToken } = require('../middleware/auth');

// ============================================================
// POST /api/assessments/:id/submit
// Submit + grade assessment
// ============================================================
router.post('/:id/submit', verifyToken, async (req, res) => {
  try {
    // ----------------------------------------------------------
    // Basic input
    // ----------------------------------------------------------
    const moduleId = Number(req.params.id);
    const userId = Number(req.user?.id);

    let answers = req.body?.answers || {};

    if (!Number.isInteger(moduleId)) {
      return res.status(400).json({
        error: 'Invalid assessment module ID'
      });
    }

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        error: 'Authenticated user ID is required'
      });
    }

    // ----------------------------------------------------------
    // Make sure answers is an object
    // ----------------------------------------------------------
    if (
      typeof answers !== 'object' ||
      answers === null ||
      Array.isArray(answers)
    ) {
      return res.status(400).json({
        error: 'Invalid answers format'
      });
    }

    // ----------------------------------------------------------
    // Find assessment module
    // ----------------------------------------------------------
    const module = await prisma.module.findUnique({
      where: {
        id: moduleId
      },
      include: {
        questions: true
      }
    });

    if (!module) {
      return res.status(404).json({
        error: 'Assessment module not found'
      });
    }

    // ----------------------------------------------------------
    // Validate module type
    // ----------------------------------------------------------
    if (!String(module.type).includes('ASSESSMENT')) {
      return res.status(400).json({
        error: 'Invalid assessment module'
      });
    }

    // ----------------------------------------------------------
    // Validate questions
    // ----------------------------------------------------------
    if (
      !Array.isArray(module.questions) ||
      module.questions.length === 0
    ) {
      return res.status(400).json({
        error: 'This assessment has no questions'
      });
    }

    // ----------------------------------------------------------
    // Check previous module
    // ----------------------------------------------------------
    if (module.sequenceOrder > 1) {
      const previousModule = await prisma.module.findFirst({
        where: {
          courseId: module.courseId,
          sequenceOrder: module.sequenceOrder - 1
        }
      });

      if (previousModule) {
        const previousProgress =
          await prisma.progress.findUnique({
            where: {
              userId_moduleId: {
                userId,
                moduleId: previousModule.id
              }
            }
          });

        if (
          !previousProgress ||
          previousProgress.status !== 'COMPLETED'
        ) {
          return res.status(403).json({
            error: 'Previous module must be completed first',
            previousModuleId: previousModule.id
          });
        }
      }
    }

    // ==========================================================
    // GRADE ASSESSMENT
    // ==========================================================

    let correctCount = 0;

    const gradingDetails = module.questions.map(
      (question) => {
        const submittedAnswer =
          answers[question.id] ??
          answers[String(question.id)] ??
          '';

        // ------------------------------------------------------
        // Parse options
        // ------------------------------------------------------
        let options = [];

        try {
          const parsed =
            JSON.parse(question.optionsJson || '[]');

          if (Array.isArray(parsed)) {
            options = parsed;
          }
        } catch (error) {
          options = [];
        }

        const correctValue = String(
          question.correctOption ?? ''
        ).trim();

        const submittedValue = String(
          submittedAnswer ?? ''
        ).trim();

        let isCorrect = false;

        // ------------------------------------------------------
        // 1. Direct text match
        //
        // DB:
        // correctOption = "Learning from labeled data"
        //
        // Frontend:
        // answer = "Learning from labeled data"
        // ------------------------------------------------------
        if (
          submittedValue !== '' &&
          submittedValue === correctValue
        ) {
          isCorrect = true;
        }

        // ------------------------------------------------------
        // 2. Database stores numeric option index
        //
        // correctOption = "0"
        // options = ["A", "B", "C", "D"]
        // ------------------------------------------------------
        if (
          !isCorrect &&
          /^\d+$/.test(correctValue)
        ) {
          const correctIndex =
            Number(correctValue);

          if (
            options[correctIndex] !== undefined &&
            submittedValue ===
              String(
                options[correctIndex]
              ).trim()
          ) {
            isCorrect = true;
          }
        }

        // ------------------------------------------------------
        // 3. Database stores A/B/C/D
        //
        // correctOption = "A"
        // options = ["A answer", "B answer", ...]
        // ------------------------------------------------------
        if (
          !isCorrect &&
          /^[A-Da-d]$/.test(correctValue)
        ) {
          const correctIndex =
            correctValue
              .toUpperCase()
              .charCodeAt(0) - 65;

          if (
            options[correctIndex] !== undefined &&
            submittedValue ===
              String(
                options[correctIndex]
              ).trim()
          ) {
            isCorrect = true;
          }
        }

        // ------------------------------------------------------
        // 4. Frontend sends A/B/C/D
        // DB stores actual answer text
        //
        // Frontend:
        // answer = "A"
        //
        // DB:
        // correctOption = "Learning from labeled data"
        // ------------------------------------------------------
        if (
          !isCorrect &&
          /^[A-Da-d]$/.test(submittedValue)
        ) {
          const submittedIndex =
            submittedValue
              .toUpperCase()
              .charCodeAt(0) - 65;

          if (
            options[submittedIndex] !== undefined &&
            String(
              options[submittedIndex]
            ).trim() === correctValue
          ) {
            isCorrect = true;
          }
        }

        // ------------------------------------------------------
        // Count correct answers
        // ------------------------------------------------------
        if (isCorrect) {
          correctCount++;
        }

        return {
          questionId: question.id,
          submittedAnswer,
          correctOption: question.correctOption,
          isCorrect
        };
      }
    );

    // ==========================================================
    // SCORE
    // ==========================================================

    const totalQuestions =
      module.questions.length;

    const score =
      totalQuestions > 0
        ? Math.round(
            (correctCount /
              totalQuestions) *
              100
          )
        : 0;

    // ----------------------------------------------------------
    // Passing score
    //
    // Use module.passingScore from database.
    // If missing/null, use 70%.
    // ----------------------------------------------------------
    const passingScore =
      module.passingScore !== null &&
      module.passingScore !== undefined
        ? Number(module.passingScore)
        : 70;

    // ----------------------------------------------------------
    // Make sure passing score is valid
    // ----------------------------------------------------------
    const safePassingScore =
      Number.isFinite(passingScore)
        ? passingScore
        : 70;

    const passed =
      score >= safePassingScore;

    // ==========================================================
    // SAVE PROGRESS
    // ==========================================================

    const progress =
      await prisma.progress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId
          }
        },

        update: {
          status: passed
            ? 'COMPLETED'
            : 'IN_PROGRESS',
          score
        },

        create: {
          userId,
          moduleId,
          status: passed
            ? 'COMPLETED'
            : 'IN_PROGRESS',
          score
        }
      });

    // ==========================================================
    // BADGE
    // ==========================================================

    let badgeIssued = false;

    if (passed) {
      const existingBadge =
        await prisma.reward.findFirst({
          where: {
            userId,
            courseId: module.courseId,
            moduleId,
            rewardType: 'BADGE'
          }
        });

      if (!existingBadge) {
        await prisma.reward.create({
          data: {
            userId,
            courseId: module.courseId,
            moduleId,
            rewardType: 'BADGE'
          }
        });

        badgeIssued = true;
      }
    }

    // ==========================================================
    // CHECK COURSE COMPLETION
    // ==========================================================

    const allModules =
      await prisma.module.findMany({
        where: {
          courseId: module.courseId
        },

        orderBy: {
          sequenceOrder: 'asc'
        }
      });

    const allProgresses =
      await prisma.progress.findMany({
        where: {
          userId,
          moduleId: {
            in: allModules.map(
              (item) => item.id
            )
          }
        }
      });

    const completedModuleIds =
      new Set(
        allProgresses
          .filter(
            (item) =>
              item.status === 'COMPLETED'
          )
          .map(
            (item) => item.moduleId
          )
      );

    const courseCompleted =
      allModules.length > 0 &&
      allModules.every(
        (item) =>
          completedModuleIds.has(
            item.id
          )
      );

    // ==========================================================
    // CERTIFICATE
    // ==========================================================

    let certificateIssued = false;

    if (courseCompleted) {
      const existingCertificate =
        await prisma.reward.findFirst({
          where: {
            userId,
            courseId: module.courseId,
            rewardType: 'CERTIFICATE'
          }
        });

      if (!existingCertificate) {
        await prisma.reward.create({
          data: {
            userId,
            courseId: module.courseId,
            rewardType: 'CERTIFICATE'
          }
        });

        certificateIssued = true;
      }
    }

    // ==========================================================
    // NEXT MODULE
    // ==========================================================

    let nextModule = null;

    if (passed) {
      nextModule =
        await prisma.module.findFirst({
          where: {
            courseId: module.courseId,
            sequenceOrder:
              module.sequenceOrder + 1
          }
        });
    }

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.json({
      success: true,

      message: passed
        ? 'Assessment passed'
        : 'Assessment submitted',

      score,

      correctCount,

      totalQuestions,

      passingScore: safePassingScore,

      passed,

      progress,

      nextModuleId:
        passed
          ? nextModule?.id ?? null
          : null,

      nextModuleUnlocked:
        passed && !!nextModule,

      nextModule: nextModule
        ? {
            id: nextModule.id,
            title: nextModule.title,
            sequenceOrder:
              nextModule.sequenceOrder,
            type: nextModule.type
          }
        : null,

      courseCompleted,

      badgeIssued,

      certificateIssued,

      gradingDetails
    });

  } catch (error) {
    console.error(
      'Assessment submit error:',
      error
    );

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;