const prisma = require('../utils/prisma');

const SKILL_KEYWORDS = {
  Python: [
    'python'
  ],

  SQL: [
    'sql',
    'database',
    'relational database',
    'query',
    'querying'
  ],

  'Data Analytics': [
    'data analytics',
    'data analysis',
    'analytics'
  ],

  'Machine Learning': [
    'machine learning',
    'machine learning',
    'regression',
    'classification',
    'model evaluation',
    'decision tree'
  ],

  'Data Visualization': [
    'data visualization',
    'visualization',
    'dashboard',
    'reporting'
  ],

  'Power BI': [
    'power bi',
    'powerbi'
  ]
};

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const detectCourseSkills = (course) => {
  const text = normalizeText(`
    ${course.title || ''}
    ${course.description || ''}
    ${(course.modules || [])
      .map((module) => module.title || '')
      .join(' ')}
  `);

  const skills = [];

  for (const [skill, keywords] of Object.entries(
    SKILL_KEYWORDS
  )) {
    const found = keywords.some((keyword) =>
      text.includes(normalizeText(keyword))
    );

    if (found) {
      skills.push(skill);
    }
  }

  return skills;
};

async function detectSkillGaps(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      designation: true,
      region: true
    }
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const courses = await prisma.course.findMany({
    include: {
      modules: true
    }
  });

  const progress = await prisma.progress.findMany({
    where: { userId },
    include: {
      module: true
    }
  });

  const progressByModule = new Map();

  for (const record of progress) {
    progressByModule.set(
      record.moduleId,
      record.status
    );
  }

  const learnedSkills = new Set();
  const currentSkills = new Set();

  const courseStatus = new Map();

  /*
   * Calculate REAL course completion.
   */
  for (const course of courses) {
    const modules = course.modules || [];

    if (!modules.length) {
      courseStatus.set(course.id, 'AVAILABLE');
      continue;
    }

    const completedCount =
      modules.filter(
        (module) =>
          progressByModule.get(module.id) ===
          'COMPLETED'
      ).length;

    if (completedCount === modules.length) {
      courseStatus.set(
        course.id,
        'COMPLETED'
      );

      detectCourseSkills(course).forEach(
        (skill) => learnedSkills.add(skill)
      );
    } else if (completedCount > 0) {
      courseStatus.set(
        course.id,
        'IN_PROGRESS'
      );

      detectCourseSkills(course).forEach(
        (skill) => currentSkills.add(skill)
      );
    } else {
      courseStatus.set(
        course.id,
        'AVAILABLE'
      );
    }
  }

  const availableSkills = new Map();

  for (const course of courses) {
    const status =
      courseStatus.get(course.id);

    if (status === 'COMPLETED') {
      continue;
    }

    const skills =
      detectCourseSkills(course);

    for (const skill of skills) {
      if (!availableSkills.has(skill)) {
        availableSkills.set(skill, []);
      }

      availableSkills
        .get(skill)
        .push({
          courseId: course.id,
          title: course.title
        });
    }
  }

  const skillGaps = [];

  for (
    const [skill, relatedCourses]
    of availableSkills.entries()
  ) {
    /*
     * If already fully learned or currently being learned,
     * don't show it as a gap.
     */
    if (
      learnedSkills.has(skill) ||
      currentSkills.has(skill)
    ) {
      continue;
    }

    skillGaps.push({
      skill,
      priority: 'Recommended',
      relatedCourses
    });
  }

  /*
   * If no strict gaps exist, expose available skills
   * as recommended skills. This prevents the dashboard
   * from being empty when the learner has completed
   * some/all current learning.
   */
  if (!skillGaps.length) {
    for (
      const [skill, relatedCourses]
      of availableSkills.entries()
    ) {
      if (learnedSkills.has(skill)) continue;

      skillGaps.push({
        skill,
        priority: 'Recommended',
        relatedCourses
      });
    }
  }

  return {
    user,
    skillGaps,

    summary: {
      learnedSkills:
        Array.from(learnedSkills),

      currentSkills:
        Array.from(currentSkills),

      totalSkillGaps:
        skillGaps.length
    },

    algorithm: {
      type:
        'rule-based-skill-gap-detection',
      version: '2.0'
    }
  };
}

module.exports = {
  detectSkillGaps,
  detectCourseSkills
};