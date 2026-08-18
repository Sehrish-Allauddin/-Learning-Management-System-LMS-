const express = require('express');
const router = express.Router();

const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

const { verifyToken } = require('../middleware/auth');
const prisma = require('../utils/prisma');

const {
  generateChatbotAnswer
} = require('../services/gemini');

const {
  recommendCourses
} = require('../services/recommendation');

// ======================================================
// TEXT HELPERS
// ======================================================

function normalize(text = '') {
  return text
    .toLowerCase()
    .trim()
    .replace(/[?!.,،:;()[\]{}"'`]/g, ' ')
    .replace(/\s+/g, ' ');
}

function contains(text, words) {
  return words.some(word => text.includes(word));
}

// ======================================================
// RECOMMENDATION SYSTEM CONTEXT
// ======================================================

function isRecommendationQuestion(message = '') {
  const msg = normalize(message);

  return contains(msg, [
    'learning performance',
    'academic performance',
    'predicted performance',
    'performance score',
    'performance level',

    'skill gap',
    'skill gaps',
    'my skill gap',
    'my skill gaps',
    'meri skills',
    'mere skill',
    'mere skill gaps',
    'recommended skill',
    'recommended skills',

    'recommendation',
    'recommendations',
    'recommended course',
    'recommended courses',
    'recommend course',
    'recommend courses',
    'which course should i take',
    'what course should i take',
    'what should i learn next',
    'next course',
    'best course for me',

    'meri performance',
    'mera performance',
    'meri learning performance',
    'meri academic performance',

    'mere liye konsa course',
    'mere liye kaunsa course',
    'mujhe konsa course',
    'mujhe kaunsa course',
    'mujhay konsa course',
    'mujhay kaunsa course',
    'mere liye kya recommend',
    'mujhe kya recommend'
  ]);
}

async function getRecommendationContext(req) {
  if (!isRecommendationQuestion(req.body?.message || '')) {
    return null;
  }

  const baseUrl =
    process.env.INTERNAL_API_URL ||
    `http://127.0.0.1:${process.env.PORT || 5000}`;

  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const headers = {
    Authorization: authorization,
    'Content-Type': 'application/json'
  };

  const safeJson = async (response) => {
    if (!response.ok) {
      throw new Error(
        `Recommendation API returned ${response.status}`
      );
    }

    return response.json();
  };

  try {
    const [
      performanceResponse,
      skillGapResponse,
      coursesResponse
    ] = await Promise.all([
      fetch(
        `${baseUrl}/api/recommendations/performance`,
        { headers }
      ),

      fetch(
        `${baseUrl}/api/recommendations/skill-gaps`,
        { headers }
      ),

      fetch(
        `${baseUrl}/api/recommendations/courses?limit=3`,
        { headers }
      )
    ]);

    const [
      performance,
      skillGaps,
      courseRecommendations
    ] = await Promise.all([
      safeJson(performanceResponse),
      safeJson(skillGapResponse),
      safeJson(coursesResponse)
    ]);

    return {
      performance: performance || null,

      skillGaps:
        skillGaps?.skillGaps || [],

      courseRecommendations:
        courseRecommendations?.recommendations || []
    };

  } catch (error) {
    console.error(
      'Recommendation context error:',
      error
    );

    return {
      available: false,
      error:
        'Recommendation data is temporarily unavailable.'
    };
  }
}

// ======================================================
// CHATBOT KNOWLEDGE / FAQ
// ======================================================

const KNOWLEDGE = [

  {
    intent: 'lms_intro',

    patterns: [
      'what is lms',
      'what is this lms',
      'lms kya hai',
      'lms kia hai',
      'ye lms kya hai',
      'lms ka kya matlab hai',
      'learning management system kya hai'
    ],

    answer:
      'LMS LMS is a Learning Management System used to manage courses, learning modules, assessments, progress, and certificates in one place.'
  },

  {
    intent: 'how_to_use',

    patterns: [
      'how to use lms',
      'how can i use lms',
      'lms kasy use karun',
      'lms kaise use karun',
      'lms use kasy hota hai',
      'lms ko kasy use karein',
      'start course kasy karun',
      'course kasy start karun'
    ],

    answer:
      'Open My Courses, select your assigned course, and use Continue to start or resume the training. Complete the modules in sequence and finish the required assessments.'
  },

  {
    intent: 'update_file',

    patterns: [
      'how to update file on lms',
      'how to update a file on lms',
      'how to update file',
      'file update kasy karun',
      'file kasy update karun',
      'lms par file kasy update hoti hai',
      'lms ma file kasy update karun',
      'course file kasy change karun',
      'pdf kasy update karun',
      'learning content kasy update karun'
    ],

    answer:
      'Learning content is managed from the course or module administration area. Authorized Admin or Moderator users can manage module content. Regular learners can open assigned content but cannot update course files.'
  },

  {
    intent: 'where_courses',

    patterns: [
      'where are my courses',
      'where can i find courses',
      'my courses kahan hain',
      'courses kahan hain',
      'course kahan se milega',
      'course kasy open karun',
      'assigned course kahan hai'
    ],

    answer:
      'You can find your assigned training under My Courses. Select a course and choose Continue to resume your learning.'
  },

  {
    intent: 'progress_help',

    patterns: [
      'how is progress calculated',
      'progress kasy calculate hota hai',
      'progress kaise calculate hota hai',
      'course progress kasy hota hai',
      'completion percentage kasy banti hai'
    ],

    answer:
      'Course progress is based on the modules recorded in your LMS progress. Completed modules contribute to your completion percentage.'
  },

  {
    intent: 'certificate_help',

    patterns: [
      'how can i get certificate',
      'how to get certificate',
      'certificate kasy milega',
      'certificate kaise milega',
      'certificate kasy hasil karun',
      'certificate kab milega',
      'certificate kyun nahi mila',
      'certificate nahi mila'
    ],

    answer:
      'Complete the required course modules and assessments. When the course requirements are fulfilled, the LMS can issue the course certificate.'
  },

  {
    intent: 'assessment_help',

    patterns: [
      'what is assessment',
      'assessment kya hai',
      'assessment kia hai',
      'assessment kasy hota hai',
      'exam kya hai',
      'quiz kya hai',
      'test kya hai',
      'assessment kaise complete karun'
    ],

    answer:
      'Assessments are LMS tests used to check your learning. Complete the assessment and meet its configured passing score to complete the assessment requirement.'
  },

  
  {
    intent: 'phishing',

    patterns: [
      'what is phishing',
      'phishing kya hai',
      'phishing kia hai',
      'phishing ka matlab kya hai',
      'phishing explain karo',
      'phishing kasy hoti hai',
      'fake email kya hai',
      'suspicious email kya hai'
    ],

    answer:
      'Phishing is an attempt to trick users into sharing sensitive information or opening harmful links. Always verify the sender and avoid suspicious links or attachments.'
  },

  {
    intent: 'suspicious_email',

    patterns: [
      'suspicious email ka kya karun',
      'suspicious email aaye to kya karun',
      'fake email aaye to kya karun',
      'phishing email aaye to kya karun',
      'email asks for password',
      'email asking for password'
    ],

    answer:
      'Do not click links or share credentials. Report the suspicious email to the appropriate IT Helpdesk or security team and verify the sender through an official channel.'
  },

  {
    intent: 'password',

    patterns: [
      'what is a strong password',
      'strong password kya hai',
      'strong password kasy banaye',
      'password kasy secure karun',
      'password security kya hai',
      'password safe kasy rakhein',
      'secure password kasy banaye'
    ],

    answer:
      'Use a long, unique password that is difficult to guess. Do not reuse passwords or share your credentials with anyone.'
  },

  {
    intent: 'security',

    patterns: [
      'what is information security',
      'information security kya hai',
      'cyber security kya hai',
      'cybersecurity kya hai',
      'security kya hai',
      'data security kya hai'
    ],

    answer:
      'Information security protects organizational and sensitive information from unauthorized access, misuse, disclosure, alteration, or loss.'
  },

  {
    intent: 'policy',

    patterns: [
      'security policy kya hai',
      'it security policy kya hai',
      'LMS security policy kya hai',
      'policy kya hai',
      'security guidelines kya hain',
      'LMS security guidelines kya hain'
    ],

    answer:
      'The LMS security training covers safe handling of information, protection of credentials, phishing awareness, and following approved security procedures and policies.'
  },

  {
    intent: 'module_types',

    patterns: [
      'what types of modules',
      'module types kya hain',
      'modules kis type ke hain',
      'lms ma module types',
      'module type kya hai'
    ],

    answer:
      'The LMS supports video, PDF, pre-assessment, post-assessment, and standard assessment modules.'
  },

  {
    intent: 'what_can_you_do',

    patterns: [
      'what can you do',
      'what can you help with',
      'how can you help me',
      'aap kya kar sakte ho',
      'tum kya kar sakte ho',
      'kis cheez ma help kar sakte ho'
    ],

    answer:
      'I can help with LMS LMS courses, modules, progress, assessments, certificates, and security-training topics such as phishing and password safety.'
  }

];

// ======================================================
// FIND KNOWLEDGE
// ======================================================

function findKnowledge(message, history = []) {

  const current = normalize(message);

  for (const item of KNOWLEDGE) {

    if (
      item.patterns.some(
        pattern =>
          current.includes(normalize(pattern))
      )
    ) {
      return item;
    }
  }

  // Check recent user messages for context
  for (
    let i = history.length - 1;
    i >= 0;
    i--
  ) {

    if (history[i]?.role !== 'user') {
      continue;
    }

    const previous =
      normalize(history[i].content || '');

    for (const item of KNOWLEDGE) {

      if (
        item.patterns.some(
          pattern =>
            previous.includes(
              normalize(pattern)
            )
        )
      ) {
        return item;
      }
    }
  }

  return null;
}

// ======================================================
// FIND COURSE
// ======================================================

function findCourse(
  courses,
  message = ''
) {

  const msg =
    normalize(message);

  if (!msg) {
    return null;
  }

  return courses.find(course => {

    const title =
      normalize(course.title);

    if (msg.includes(title)) {
      return true;
    }

    const words =
      title
        .split(' ')
        .filter(
          word => word.length > 3
        );

    return words.some(
      word => msg.includes(word)
    );
  });
}

function findCourseFromConversation(
  courses,
  message,
  history = []
) {

  const currentCourse =
    findCourse(
      courses,
      message
    );

  if (currentCourse) {
    return currentCourse;
  }

  for (
    let i = history.length - 1;
    i >= 0;
    i--
  ) {

    if (
      history[i]?.role !== 'user'
    ) {
      continue;
    }

    const previousCourse =
      findCourse(
        courses,
        history[i].content || ''
      );

    if (previousCourse) {
      return previousCourse;
    }
  }

  return null;
}
// ======================================================
// USER + LMS DATABASE CONTEXT
// ======================================================

async function getUserContext(userId) {
  try {
    // =====================================================
    // 1. CURRENT USER / PROFILE
    // =====================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        erpId: true,
        designation: true,
        region: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return {
        available: false,
        message: 'User information is not available.'
      };
    }

    // =====================================================
    // 2. COURSES + MODULES + PROGRESS
    // =====================================================

    const progressRecords = await prisma.progress.findMany({
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
        module: {
          sequenceOrder: 'asc'
        }
      }
    });

    // =====================================================
    // 3. COURSE INFORMATION
    // =====================================================

    const courseMap = new Map();

    for (const record of progressRecords) {
      const course = record.module.course;

      if (!courseMap.has(course.id)) {
        courseMap.set(course.id, {
          id: course.id,
          title: course.title,
          description: course.description,
          stage: course.stage,
          timeLimitMins: course.timeLimitMins,
          modules: []
        });
      }

      courseMap.get(course.id).modules.push({
        id: record.module.id,
        title: record.module.title,
        type: record.module.type,
        sequenceOrder: record.module.sequenceOrder,
        contentUrl: record.module.contentUrl,
        timeLimitMins: record.module.timeLimitMins,
        passingScore: record.module.passingScore,

        progress: {
          status: record.status,
          score: record.score
        }
      });
    }

    // =====================================================
    // 4. REWARDS / BADGES / CERTIFICATES
    // =====================================================

    const rewards = await prisma.reward.findMany({
      where: {
        userId
      },
      include: {
        course: true,
        module: true
      },
      orderBy: {
        earnedDate: 'desc'
      }
    });

    const badges = rewards
      .filter(reward => reward.rewardType === 'BADGE')
      .map(reward => ({
        id: reward.id,
        rewardType: reward.rewardType,
        course: reward.course
          ? {
              id: reward.course.id,
              title: reward.course.title
            }
          : null,
        module: reward.module
          ? {
              id: reward.module.id,
              title: reward.module.title
            }
          : null,
        earnedDate: reward.earnedDate
      }));

    const certificates = rewards
      .filter(reward => reward.rewardType === 'CERTIFICATE')
      .map(reward => ({
        id: reward.id,
        rewardType: reward.rewardType,
        course: reward.course
          ? {
              id: reward.course.id,
              title: reward.course.title
            }
          : null,
        earnedDate: reward.earnedDate
      }));

    // =====================================================
    // 5. LEARNING PATHS
    // =====================================================

    const learningPaths = await prisma.learningPath.findMany({
      include: {
        courses: {
          include: {
            course: true
          },
          orderBy: {
            sequenceOrder: 'asc'
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    // =====================================================
    // 6. NOTIFICATIONS
    // =====================================================

    const notifications = await prisma.notification.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        content: true,
        type: true,
        read: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // =====================================================
    // 7. DISCUSSIONS + COMMENTS
    // =====================================================

    const discussions = await prisma.discussion.findMany({
      where: {
        userId
      },
      include: {
        course: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // =====================================================
    // 8. FEEDBACK
    // =====================================================

    const feedback = await prisma.feedback.findMany({
      where: {
        userId
      },
      include: {
        course: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // =====================================================
    // 8A. ALL LMS COURSES
    // =====================================================
    // This gives the chatbot knowledge about courses even when
    // the current user has no progress record for that course.

    const allCourses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: {
            sequenceOrder: 'asc'
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    // =====================================================
    // 8B. ALL COURSE / MODULE INFORMATION
    // =====================================================

    const courseCatalog = allCourses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      stage: course.stage,
      timeLimitMins: course.timeLimitMins,

      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        type: module.type,
        sequenceOrder: module.sequenceOrder,
        contentUrl: module.contentUrl,
        timeLimitMins: module.timeLimitMins,
        passingScore: module.passingScore
      }))
    }));

    // =====================================================
    // 8C. ASSESSMENT INFORMATION
    // =====================================================

    const assessmentModules = allCourses.flatMap(course =>
      course.modules
        .filter(module =>
          module.type === 'PRE_ASSESSMENT' ||
          module.type === 'POST_ASSESSMENT' ||
          module.type === 'STANDARD_ASSESSMENT'
        )
        .map(module => {
          const userProgress = progressRecords.find(
            progress => progress.moduleId === module.id
          );

          return {
            courseId: course.id,
            courseTitle: course.title,

            moduleId: module.id,
            moduleTitle: module.title,

            type: module.type,
            sequenceOrder: module.sequenceOrder,
            timeLimitMins: module.timeLimitMins,
            passingScore: module.passingScore,

            userStatus: userProgress
              ? userProgress.status
              : 'LOCKED',

            userScore: userProgress
              ? userProgress.score
              : null
          };
        })
    );

    // =====================================================
    // 8D. USER PROGRESS SUMMARY
    // =====================================================

    const totalModules = progressRecords.length;

    const completedModules = progressRecords.filter(
      item => item.status === 'COMPLETED'
    ).length;

    const inProgressModules = progressRecords.filter(
      item => item.status === 'IN_PROGRESS'
    ).length;

    const lockedModules = progressRecords.filter(
      item => item.status === 'LOCKED'
    ).length;

    const progressPercentage =
      totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

    const currentModule =
      progressRecords.find(
        item => item.status === 'IN_PROGRESS'
      ) || null;

    const nextLockedModule =
      progressRecords.find(
        item => item.status === 'LOCKED'
      ) || null;

    const progressSummary = {
      totalModules,
      completedModules,
      inProgressModules,
      lockedModules,
      progressPercentage,

      currentModule: currentModule
        ? {
            id: currentModule.module.id,
            title: currentModule.module.title,
            courseId: currentModule.module.course.id,
            courseTitle: currentModule.module.course.title
          }
        : null,

      nextLockedModule: nextLockedModule
        ? {
            id: nextLockedModule.module.id,
            title: nextLockedModule.module.title,
            courseId: nextLockedModule.module.course.id,
            courseTitle: nextLockedModule.module.course.title
          }
        : null
    };

    // =====================================================
    // 8I. PERSONALIZED COURSE RECOMMENDATIONS
    // =====================================================

    let recommendations = {
      recommendations: [],
      algorithm: null
    };

    try {
      recommendations = await recommendCourses(
        userId,
        { limit: 3 }
      );
    } catch (recommendationError) {
      console.error(
        'Error loading personalized recommendations:',
        recommendationError
      );
    }

    // =====================================================
    // 8E. ADMIN / LMS-WIDE INFORMATION
    // =====================================================

    // Total users in the LMS
    const totalUsers = await prisma.user.count();

    // Total courses in the LMS
    const totalCourses = await prisma.course.count();

    // Total learning paths
    const totalLearningPaths = await prisma.learningPath.count();

    // Total certificates issued
    const totalCertificates = await prisma.reward.count({
      where: {
        rewardType: 'CERTIFICATE'
      }
    });

    // Total badges issued
    const totalBadges = await prisma.reward.count({
      where: {
        rewardType: 'BADGE'
      }
    });

    // =====================================================
    // 8F. LMS-WIDE SUMMARY
    // =====================================================

    const lmsSummary = {
      totalUsers,
      totalCourses,
      totalLearningPaths,
      totalCertificates,
      totalBadges,

      supportedRoles: [
        'ADMIN',
        'MODERATOR',
        'USER'
      ],

      supportedModuleTypes: [
        'VIDEO',
        'PDF',
        'PRE_ASSESSMENT',
        'POST_ASSESSMENT',
        'STANDARD_ASSESSMENT'
      ],

      progressStatuses: [
        'LOCKED',
        'IN_PROGRESS',
        'COMPLETED'
      ],

      courseStages: [
        'PLANNING',
        'EXECUTION',
        'MONITORING'
      ]
    };

    // =====================================================
    // 8G. COURSE FEEDBACK SUMMARY
    // =====================================================

    const courseFeedback = await prisma.feedback.findMany({
      select: {
        id: true,
        courseId: true,
        rating: true,
        feedbackText: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // =====================================================
    // 8H. DISCUSSION ACTIVITY
    // =====================================================

    const recentDiscussions = await prisma.discussion.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        courseId: true,
        userId: true,
        createdAt: true,
        course: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    // =====================================================
    // 9. FINAL LMS CONTEXT
    // =====================================================

    return {
      available: true,

     user: {
       id: user.id,
       name: user.name,
       erpId: user.erpId,
       designation: user.designation,
       region: user.region,
       role: user.role
     },

     courses: Array.from(courseMap.values()),

     courseCatalog,

     assessmentModules,

     progressSummary,

     recommendations: {
       courses: recommendations.recommendations || [],
       algorithm: recommendations.algorithm || null
    },

     lmsSummary,

      learningPaths: learningPaths.map(path => ({
        id: path.id,
        title: path.title,
        description: path.description,

        courses: path.courses.map(item => ({
          id: item.course.id,
          title: item.course.title,
          description: item.course.description,
          stage: item.course.stage,
          sequenceOrder: item.sequenceOrder
        }))
      })),

      badges,

      certificates,

      notifications,

      discussions: discussions.map(discussion => ({
        id: discussion.id,
        title: discussion.title,
        content: discussion.content,

        course: discussion.course
          ? {
              id: discussion.course.id,
              title: discussion.course.title
            }
          : null,

        createdAt: discussion.createdAt,

        comments: discussion.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          user: comment.user,
          createdAt: comment.createdAt
        }))
      })),

      feedback: feedback.map(item => ({
        id: item.id,

        course: item.course
          ? {
              id: item.course.id,
              title: item.course.title
            }
          : null,

        rating: item.rating,
        feedbackText: item.feedbackText,
        createdAt: item.createdAt
      }))
    };

  } catch (error) {

    console.error(
      'Error building LMS chatbot context:',
      error
    );

    return {
      available: false,
      message:
        'LMS information is temporarily unavailable.'
    };
  }
}

// ======================================================
// PROGRESS ANSWER
// ======================================================

function getProgressReply(
  context,
  course = null
) {

  const {
    progress,
    user
  } = context;

  const rows = course
    ? progress.filter(
        item =>
          item.module.course.id === course.id
      )
    : progress;

  const totalModules = course
    ? course.modules.length
    : rows.length;

  if (
    !rows.length &&
    !course
  ) {

    return `No course progress has been recorded for ${
      user?.name || 'your account'
    } yet.`;
  }

  const completed =
    rows.filter(
      item =>
        item.status === 'COMPLETED'
    ).length;

  const inProgress =
    rows.filter(
      item =>
        item.status === 'IN_PROGRESS'
    ).length;

  const percentage =
    totalModules
      ? Math.round(
          (completed / totalModules) * 100
        )
      : 0;

  if (course) {

    return `Your progress in "${course.title}" is ${percentage}%. ${completed} of ${totalModules} module(s) completed.`;
  }

  return `Your current LMS progress is ${percentage}%. ${completed} module(s) completed and ${inProgress} module(s) in progress.`;
}

// ======================================================
// CERTIFICATE ANSWER
// ======================================================

function getCertificateReply(
  context,
  message,
  history
) {

  const {
    rewards,
    courses,
    progress
  } = context;

  const course =
    findCourseFromConversation(
      courses,
      message,
      history
    );

  if (course) {

    const certificate =
      rewards.find(
        reward =>
          reward.courseId === course.id
      );

    if (certificate) {

      return `Your certificate for "${course.title}" has been earned.`;
    }

    const courseProgress =
      progress.filter(
        item =>
          item.module.course.id === course.id
      );

    const completed =
      courseProgress.filter(
        item =>
          item.status === 'COMPLETED'
      ).length;

    const total =
      course.modules.length;

    if (
      total > 0 &&
      completed === total
    ) {

      return `You have completed all ${total} modules of "${course.title}". If the certificate is not visible, please check the course page or contact the LMS administrator.`;
    }

    return `Your certificate for "${course.title}" is not available yet. Complete the required modules and assessments first.`;
  }

  if (rewards.length) {

    const list =
      rewards
        .map(
          reward =>
            reward.course.title
        )
        .join(', ');

    return `You have earned certificate(s) for: ${list}.`;
  }

  return 'You have not earned a certificate yet. Complete the required course modules and assessments to become eligible.';
}

// ======================================================
// COURSES ANSWER
// ======================================================

function getCourseReply(courses) {

  if (!courses.length) {

    return 'There are currently no active courses available.';
  }

  return `Available courses:\n${
    courses
      .map(
        (course, index) =>
          `${index + 1}. ${course.title}`
      )
      .join('\n')
  }`;
}

// ======================================================
// MODULE ANSWER
// ======================================================

function getModuleReply(
  context,
  message,
  history
) {

  const {
    courses
  } = context;

  const course =
    findCourseFromConversation(
      courses,
      message,
      history
    );

  if (!course) {

    return 'Please mention the course name so I can show its modules.';
  }

  if (!course.modules.length) {

    return `"${course.title}" currently has no modules.`;
  }

  const modules =
    course.modules
          .map(
        (module, index) =>
          `${index + 1}. ${module.title}`
      )
      .join('\n');

  return `Modules in "${course.title}":\n${modules}`;
}

// ======================================================
// NEXT MODULE ANSWER
// ======================================================

function getNextModuleReply(
  context,
  message,
  history
) {

  const {
    courses,
    progress
  } = context;

  const course =
    findCourseFromConversation(
      courses,
      message,
      history
    );

  if (!course) {

    return 'Please mention the course name so I can identify your next module.';
  }

  const courseProgress =
    progress.filter(
      item =>
        item.module.course.id === course.id
    );

  const nextModule =
    course.modules.find(
      module => {

        const record =
          courseProgress.find(
            item =>
              item.moduleId === module.id
          );

        return (
          !record ||
          record.status !== 'COMPLETED'
        );
      }
    );

  if (!nextModule) {

    return `You have completed all modules in "${course.title}".`;
  }

  return `Your next incomplete module in "${course.title}" is "${nextModule.title}".`;
}

// ======================================================
// ASSESSMENT ANSWER
// ======================================================

function getAssessmentReply(
  context,
  message,
  history
) {

  const {
    courses,
    progress
  } = context;

  const course =
    findCourseFromConversation(
      courses,
      message,
      history
    );

  const modules =
    course
      ? course.modules
      : courses.flatMap(
          item => item.modules
        );

  const assessments =
    modules.filter(
      module =>
        [
          'PRE_ASSESSMENT',
          'POST_ASSESSMENT',
          'STANDARD_ASSESSMENT'
        ].includes(module.type)
    );

  if (!assessments.length) {

    return course
      ? `No assessment information is currently available for "${course.title}".`
      : 'No assessment information is currently available.';
  }

  const details =
    assessments.map(
      module => {

        const userProgress =
          progress.find(
            item =>
              item.moduleId === module.id
          );

        let result =
          module.title;

        if (
          module.passingScore !== null &&
          module.passingScore !== undefined
        ) {

          result +=
            ` — Passing score: ${module.passingScore}%.`;
        }

        if (
          userProgress?.score !== null &&
          userProgress?.score !== undefined
        ) {

          result +=
            ` Your score: ${userProgress.score}%.`;
        }

        return result;
      }
    );

  return `Assessment information:\n${details.join('\n')}`;
}

// ======================================================
// INTENT DETECTION
// ======================================================

function detectIntent(
  message,
  history = []
) {

  const msg =
    normalize(message);

  const knowledge =
    findKnowledge(
      message,
      history
    );

  if (knowledge) {
    return knowledge.intent;
  }

  if (
    /^(hi|hello|hey|salam|aoa|assalam o alaikum|assalamualaikum)\b/
      .test(msg)
  ) {
    return 'greeting';
  }

  if (
    contains(
      msg,
      [
        'thank',
        'thanks',
        'shukriya',
        'bohat shukriya'
      ]
    )
  ) {
    return 'thanks';
  }

  if (
    contains(
      msg,
      [
        'progress',
        'meri progress',
        'mera progress',
        'completion',
        'completed',
        'complete hua',
        'kitna complete',
        'kitna hua'
      ]
    )
  ) {
    return 'progress';
  }

  if (
    contains(
      msg,
      [
        'certificate',
        'certificat',
        'certificate kab',
        'certificate kasy',
        'certificate kaise',
        'certificate mila',
        'certificate milay'
      ]
    )
  ) {
    return 'certificate';
  }

  if (
    contains(
      msg,
      [
        'assessment',
        'assessments',
        'exam',
        'test',
        'quiz',
        'marks',
        'score',
        'passing score',
        'passing marks',
        'pass marks'
      ]
    )
  ) {
    return 'assessment';
  }

  if (
    contains(
      msg,
      [
        'module',
        'modules',
        'lesson',
        'lessons',
        'chapter',
        'topic',
        'topics'
      ]
    )
  ) {
    return 'modules';
  }

  if (
    contains(
      msg,
      [
        'course',
        'courses',
        'training',
        'trainings'
      ]
    )
  ) {
    return 'courses';
  }

  return 'general';
}

// ======================================================
// MAIN CHATBOT API
// ======================================================

router.post(
  '/message',
  verifyToken,
  upload.single('file'),
  async (req, res) => {

    try {

      const {
        message,
        history: rawHistory = '[]'
      } = req.body || {};

      const history =
        typeof rawHistory === 'string'
         ? JSON.parse(rawHistory || '[]')
         : rawHistory;;

      // --------------------------------------------------
      // Validate message
      // --------------------------------------------------

      if (
        !message ||
        !message.trim()
      ) {

        return res.status(400).json({
          error: 'Message is required'
        });
      }

      // --------------------------------------------------
      // Recent conversation history
      // --------------------------------------------------

      const recentHistory =
        Array.isArray(history)
          ? history.slice(-8)
          : [];

      // --------------------------------------------------
      // Get actual LMS data
      // --------------------------------------------------

       const context =await getUserContext(req.user.id);

       const recommendationContext =
          await getRecommendationContext(req);

      const intent =
        detectIntent(
          message,
          recentHistory
      );
      // ==================================================
      // SEND QUESTION + LMS DATA TO GEMINI
      // ==================================================

      const aiReply =
        await generateChatbotAnswer({
          message,
          history: recentHistory,
          context:{context,recommendations: recommendationContext},
         
        });

      // ==================================================
      // RETURN AI RESPONSE
      // ==================================================

      return res.json({

        reply:
          aiReply,

        intent:
          'ai'
      });

    } catch (error) {

      console.error(
        'Chatbot error:',
        error
      );

      return res.status(500).json({

        error:
          'Unable to process your request right now.'
      });
    }
  }
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;