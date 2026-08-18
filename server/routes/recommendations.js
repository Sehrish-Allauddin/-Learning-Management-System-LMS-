const express = require('express');
const router = express.Router();

const { verifyToken } =
  require('../middleware/auth');

const {
  recommendCourses
} = require('../services/recommendation');

const {
  detectSkillGaps
} = require('../services/skillGap');

const {
  getStudentPerformance
} = require('../services/performancePrediction');

// ==================================================
// COURSE RECOMMENDATIONS
// ==================================================

router.get(
  '/courses',
  verifyToken,
  async (req, res) => {
    try {
      const userId = Number(
        req.user?.id || req.userId
      );

      if (!userId) {
        return res.status(401).json({
          error:
            'Authenticated user ID is required.'
        });
      }

      const limit =
        Number(req.query.limit) || 5;

      const result =
        await recommendCourses(
          userId,
          { limit }
        );

      return res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error(
        'Recommendation API error:',
        error
      );

      return res.status(500).json({
        success: false,
        error:
          'Failed to generate course recommendations.',
        details: error.message
      });
    }
  }
);

// ==================================================
// PERFORMANCE
// ==================================================

router.get(
  '/performance',
  verifyToken,
  async (req, res) => {
    try {
      const userId = Number(
        req.user?.id || req.userId
      );

      if (!userId) {
        return res.status(401).json({
          error:
            'Authenticated user ID is required.'
        });
      }

      const result =
        await getStudentPerformance(userId);

      return res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error(
        'Performance prediction API error:',
        error
      );

      return res.status(500).json({
        success: false,
        error:
          'Failed to predict student performance.',
        details: error.message
      });
    }
  }
);

// ==================================================
// SKILL GAPS
// ==================================================

router.get(
  '/skill-gaps',
  verifyToken,
  async (req, res) => {
    try {
      const userId = Number(
        req.user?.id || req.userId
      );

      if (!userId) {
        return res.status(401).json({
          error:
            'Authenticated user ID is required.'
        });
      }

      const result =
        await detectSkillGaps(userId);

      return res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error(
        'Skill-gap detection API error:',
        error
      );

      return res.status(500).json({
        success: false,
        error:
          'Failed to detect student skill gaps.',
        details: error.message
      });
    }
  }
);

module.exports = router;