const prisma = require('../utils/prisma');

const clamp = (value, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value) =>
  new Set(
    normalizeText(value)
      .split(' ')
      .filter((word) => word.length >= 3)
  );

const calculateTextSimilarity = (textA, textB) => {
  const a = tokenize(textA);
  const b = tokenize(textB);

  if (!a.size || !b.size) return 0;

  let intersection = 0;

  for (const word of a) {
    if (b.has(word)) intersection++;
  }

  const union = new Set([...a, ...b]).size;

  return union ? (intersection / union) * 100 : 0;
};

const calculateCoursePerformance = (progressRecords) => {
  const scored = progressRecords.filter(
    (item) =>
      item.score !== null &&
      item.score !== undefined &&
      Number.isFinite(Number(item.score))
  );

  if (!scored.length) return 50;

  const average =
    scored.reduce(
      (sum, item) => sum + Number(item.score),
      0
    ) / scored.length;

  return clamp(average);
};

/*
 * IMPORTANT:
 * Course is completed ONLY when ALL its modules
 * are completed.
 */
const getCompletedCourseIds = (courses, progressRecords) => {
  const completed = new Set();

  const progressByModule = new Map();

  for (const progress of progressRecords) {
    progressByModule.set(
      progress.moduleId,
      progress.status
    );
  }

  for (const course of courses) {
    const modules = course.modules || [];

    if (!modules.length) continue;

    const allCompleted = modules.every(
      (module) =>
        progressByModule.get(module.id) === 'COMPLETED'
    );

    if (allCompleted) {
      completed.add(course.id);
    }
  }

  return completed;
};

const getCourseProgressMap = (progressRecords) => {
  const map = new Map();

  for (const progress of progressRecords) {
    const courseId = progress.module?.courseId;

    if (!courseId) continue;

    if (!map.has(courseId)) {
      map.set(courseId, []);
    }

    map.get(courseId).push(progress);
  }

  return map;
};

const calculateProgressRelevance = (courseProgress) => {
  if (!courseProgress?.length) return 0;

  const completed = courseProgress.filter(
    (item) => item.status === 'COMPLETED'
  ).length;

  const inProgress = courseProgress.filter(
    (item) => item.status === 'IN_PROGRESS'
  ).length;

  if (inProgress > 0) return 100;
  if (completed > 0) return 70;

  return 0;
};

const calculateFeedbackScore = (
  feedbackRecords,
  courseId
) => {
  const feedback = feedbackRecords.filter(
    (item) => item.courseId === courseId
  );

  if (!feedback.length) return 50;

  const ratings = feedback
    .map((item) => Number(item.rating))
    .filter(Number.isFinite);

  if (!ratings.length) return 50;

  const average =
    ratings.reduce((sum, rating) => sum + rating, 0) /
    ratings.length;

  return clamp((average / 5) * 100);
};

const calculateLearningPathScore = (
  learningPaths,
  courseId
) => {
  for (const path of learningPaths) {
    const courses = path.courses || [];

    if (
      courses.some(
        (item) => item.courseId === courseId
      )
    ) {
      return 100;
    }
  }

  return 0;
};

const calculateDesignationRelevance = (
  designation,
  course
) => {
  const userText = normalizeText(designation);

  if (!userText) return 0;

  const courseText = normalizeText(
    `${course.title || ''} ${course.description || ''}`
  );

  const words = userText
    .split(' ')
    .filter((word) => word.length >= 3);

  if (!words.length) return 0;

  const matches = words.filter((word) =>
    courseText.includes(word)
  ).length;

  return clamp((matches / words.length) * 100);
};

const calculateRecommendationScore = ({
  similarityScore,
  performanceScore,
  progressScore,
  feedbackScore,
  learningPathScore,
  designationScore
}) => {
  const score =
    similarityScore * 0.30 +
    performanceScore * 0.20 +
    progressScore * 0.20 +
    feedbackScore * 0.10 +
    learningPathScore * 0.10 +
    designationScore * 0.10;

  return Math.round(clamp(score) * 100) / 100;
};

const buildReason = ({
  similarityScore,
  progressScore,
  learningPathScore,
  designationScore,
  feedbackScore
}) => {
  const reasons = [];

  if (progressScore >= 80) {
    reasons.push(
      'related to your current learning activity'
    );
  }

  if (similarityScore >= 20) {
    reasons.push(
      'matches your learning history'
    );
  }

  if (learningPathScore >= 80) {
    reasons.push(
      'included in a learning path'
    );
  }

  if (designationScore >= 25) {
    reasons.push(
      'relevant to your designation'
    );
  }

  if (feedbackScore >= 80) {
    reasons.push(
      'well-rated in the LMS'
    );
  }

  if (!reasons.length) {
    reasons.push(
      'recommended based on your LMS profile'
    );
  }

  return reasons.join(', ');
};

async function getUserRecommendationData(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      designation: true,
      region: true,
      role: true
    }
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const progress = await prisma.progress.findMany({
    where: { userId },
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

  const feedback = await prisma.feedback.findMany({
    where: { userId },
    select: {
      id: true,
      courseId: true,
      rating: true,
      feedbackText: true,
      createdAt: true
    }
  });

  const learningPaths =
    await prisma.learningPath.findMany({
      include: {
        courses: {
          include: {
            course: true
          }
        }
      }
    });

  /*
   * Do NOT filter with:
   * stage: { not: 'PLANNING' }
   *
   * because that can accidentally return zero courses
   * when stage is null/different in the database.
   */
  const courses = await prisma.course.findMany({
    include: {
      modules: true,
      feedback: {
        select: {
          rating: true
        }
      },
      learningPaths: true
    }
  });

  return {
    user,
    progress,
    feedback,
    learningPaths,
    courses
  };
}

async function recommendCourses(
  userId,
  options = {}
) {
  const limit = Math.min(
    Math.max(Number(options.limit) || 5, 1),
    20
  );

  const {
    user,
    progress,
    feedback,
    learningPaths,
    courses
  } = await getUserRecommendationData(userId);

  const completedCourseIds =
    getCompletedCourseIds(
      courses,
      progress
    );

  const courseProgressMap =
    getCourseProgressMap(progress);

  const learningHistoryText = progress
    .map((item) => {
      const course = item.module?.course;

      return `
        ${course?.title || ''}
        ${course?.description || ''}
        ${item.module?.title || ''}
      `;
    })
    .join(' ');

  const performanceScore =
    calculateCoursePerformance(progress);

  const recommendations = [];

  for (const course of courses) {
    /*
     * Only skip courses that are REALLY completed.
     */
    if (completedCourseIds.has(course.id)) {
      continue;
    }

    const courseText = `
      ${course.title || ''}
      ${course.description || ''}
      ${(course.modules || [])
        .map((module) => module.title || '')
        .join(' ')}
    `;

    const similarityScore =
      calculateTextSimilarity(
        learningHistoryText,
        courseText
      );

    const progressScore =
      calculateProgressRelevance(
        courseProgressMap.get(course.id)
      );

    const feedbackScore =
      calculateFeedbackScore(
        feedback,
        course.id
      );

    const learningPathScore =
      calculateLearningPathScore(
        learningPaths,
        course.id
      );

    const designationScore =
      calculateDesignationRelevance(
        user.designation,
        course
      );

    const recommendationScore =
      calculateRecommendationScore({
        similarityScore,
        performanceScore,
        progressScore,
        feedbackScore,
        learningPathScore,
        designationScore
      });

    recommendations.push({
      courseId: course.id,
      title: course.title,
      description: course.description,
      stage: course.stage,
      score: recommendationScore,
      reason: buildReason({
        similarityScore,
        progressScore,
        learningPathScore,
        designationScore,
        feedbackScore
      })
    });
  }

  recommendations.sort(
    (a, b) => b.score - a.score
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      designation: user.designation,
      region: user.region
    },

    recommendations:
      recommendations.slice(0, limit),

    totalCandidates:
      recommendations.length,

    algorithm: {
      type: 'hybrid-content-behavior-baseline',
      version: '2.0'
    }
  };
}

module.exports = {
  recommendCourses,
  getUserRecommendationData,
  calculateTextSimilarity,
  calculateCoursePerformance
};