const prisma = require('../utils/prisma');

const clamp = (value, min = 0, max = 100) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Student Performance Prediction
 *
 * Simple LMS baseline model.
 *
 * Uses:
 * - Previous assessment scores
 * - Completed modules
 * - In-progress modules
 *
 * No database migration required.
 */

async function getStudentPerformance(userId) {
  const progress = await prisma.progress.findMany({
    where: {
      userId
    },
    include: {
      module: {
        include: {
          course: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  if (!progress.length) {
    return {
      available: false,
      message: 'Not enough learning data to predict performance.'
    };
  }

  const scoredRecords = progress.filter(
    (item) =>
      Number.isFinite(item.score) &&
      item.score >= 0 &&
      item.score <= 100
  );

  const completed = progress.filter(
    (item) => item.status === 'COMPLETED'
  );

  const inProgress = progress.filter(
    (item) => item.status === 'IN_PROGRESS'
  );

  // --------------------------------------------------
  // 1. Average performance
  // --------------------------------------------------

  const averageScore = scoredRecords.length
    ? scoredRecords.reduce(
        (sum, item) => sum + item.score,
        0
      ) / scoredRecords.length
    : 50;

  // --------------------------------------------------
  // 2. Completion rate
  // --------------------------------------------------

  const completionRate =
    progress.length > 0
      ? (completed.length / progress.length) * 100
      : 0;

  // --------------------------------------------------
  // 3. Learning activity
  // --------------------------------------------------

  const activityScore = clamp(
    completionRate * 0.7 +
      (inProgress.length > 0 ? 30 : 0)
  );

  // --------------------------------------------------
  // 4. Final predicted performance
  // --------------------------------------------------

  const predictedScore =
    averageScore * 0.70 +
    activityScore * 0.30;

  const prediction = Math.round(
    clamp(predictedScore) * 100
  ) / 100;

  // --------------------------------------------------
  // 5. Performance category
  // --------------------------------------------------

  let performanceLevel;

  if (prediction >= 80) {
    performanceLevel = 'Good';
  } else if (prediction >= 60) {
    performanceLevel = 'Moderate';
  } else {
    performanceLevel = 'Needs Attention';
  }

  // --------------------------------------------------
  // 6. Generate simple explanation
  // --------------------------------------------------

  const factors = [];

  if (averageScore >= 80) {
    factors.push('strong assessment performance');
  } else if (averageScore >= 60) {
    factors.push('moderate assessment performance');
  } else {
    factors.push('low assessment performance');
  }

  if (completionRate >= 70) {
    factors.push('good module completion');
  } else if (completionRate >= 40) {
    factors.push('moderate module completion');
  } else {
    factors.push('low module completion');
  }

  if (inProgress.length > 0) {
    factors.push('active learning progress');
  }

  return {
    available: true,

    prediction: {
      predictedScore: prediction,
      performanceLevel
    },

    statistics: {
      totalProgressRecords: progress.length,
      scoredRecords: scoredRecords.length,
      completedModules: completed.length,
      inProgressModules: inProgress.length,
      averageScore:
        Math.round(averageScore * 100) / 100,
      completionRate:
        Math.round(completionRate * 100) / 100
    },

    factors
  };
}


module.exports = {
  getStudentPerformance
};