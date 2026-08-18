const prisma = require('./server/utils/prisma');
async function main() {
  const userId = 4;

  console.log(`Creating test learning history for user ${userId}...`);

  // Get our dummy courses with their modules
  const courses = await prisma.course.findMany({
    where: {
      title: {
        in: [
          'Python Fundamentals',
          'Data Analytics Basics',
          'Machine Learning Fundamentals',
          'SQL for Data Management',
          'Data Visualization with Power BI'
        ]
      }
    },
    include: {
      modules: {
        orderBy: {
          sequenceOrder: 'asc'
        }
      }
    }
  });

  
  if (!courses.length) {
    throw new Error('No dummy courses found.');
  }

  const courseMap = new Map(
    courses.map((course) => [course.title, course])
  );

  // --------------------------------------------------
  // 1. Python Fundamentals - COMPLETED
  // --------------------------------------------------

  const python = courseMap.get('Python Fundamentals');

  if (python) {
    for (const module of python.modules) {
      await prisma.progress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: module.id
          }
        },
        update: {
          status: 'COMPLETED',
          score: 90
        },
        create: {
          userId,
          moduleId: module.id,
          status: 'COMPLETED',
          score: 90
        }
      });
    }

    console.log('Python Fundamentals → COMPLETED, score 90');
  }

  // --------------------------------------------------
  // 2. Data Analytics Basics - COMPLETED
  // --------------------------------------------------

  const analytics = courseMap.get('Data Analytics Basics');

  if (analytics) {
    for (const module of analytics.modules) {
      await prisma.progress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: module.id
          }
        },
        update: {
          status: 'COMPLETED',
          score: 85
        },
        create: {
          userId,
          moduleId: module.id,
          status: 'COMPLETED',
          score: 85
        }
      });
    }

    console.log('Data Analytics Basics → COMPLETED, score 85');
  }

  // --------------------------------------------------
  // 3. Machine Learning Fundamentals - IN PROGRESS
  // --------------------------------------------------

  const machineLearning =
    courseMap.get('Machine Learning Fundamentals');

  if (machineLearning) {
    const modulesToProgress =
      machineLearning.modules.slice(0, 2);

    for (const module of modulesToProgress) {
      await prisma.progress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: module.id
          }
        },
        update: {
          status: 'IN_PROGRESS',
          score: 70
        },
        create: {
          userId,
          moduleId: module.id,
          status: 'IN_PROGRESS',
          score: 70
        }
      });
    }

    console.log(
      'Machine Learning Fundamentals → IN_PROGRESS'
    );
  }

  console.log('');
  console.log('Test learning history created successfully.');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });