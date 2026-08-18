const prisma = require('./utils/prisma');

async function main() {
  console.log('Creating dummy recommendation courses...');

  // Find an existing admin/user to use as course creator
  const creator = await prisma.user.findFirst();

  if (!creator) {
    throw new Error('No user exists. Create a user first.');
  }

  
  const courses = [
    {
      title: 'Python Fundamentals',
      description:
        'Learn Python programming fundamentals including variables, data types, functions, loops, and basic problem solving.',
      modules: [
        'Python Basics',
        'Variables and Data Types',
        'Conditions and Loops',
        'Functions',
        'Python Practice'
      ]
    },
    {
      title: 'Data Analytics Basics',
      description:
        'Learn the fundamentals of data analytics, data cleaning, exploratory analysis, and interpreting business data.',
      modules: [
        'Introduction to Data Analytics',
        'Data Cleaning',
        'Exploratory Data Analysis',
        'Basic Statistics',
        'Analytics Case Study'
      ]
    },
    {
      title: 'Machine Learning Fundamentals',
      description:
        'Introduction to machine learning concepts including supervised learning, regression, classification, model evaluation, and practical ML workflows.',
      modules: [
        'Introduction to Machine Learning',
        'Supervised Learning',
        'Regression',
        'Classification',
        'Model Evaluation'
      ]
    },
    {
      title: 'SQL for Data Management',
      description:
        'Learn SQL for querying and managing relational databases including SELECT queries, filtering, joins, grouping, and aggregation.',
      modules: [
        'Introduction to SQL',
        'SELECT Queries',
        'Filtering and Sorting',
        'JOIN Operations',
        'Grouping and Aggregation'
      ]
    },
    {
      title: 'Data Visualization with Power BI',
      description:
        'Learn how to transform data into interactive dashboards and reports using Power BI and effective data visualization techniques.',
      modules: [
        'Introduction to Power BI',
        'Data Import and Transformation',
        'Data Modeling',
        'Charts and Visualizations',
        'Dashboard Development'
      ]
    }
  ];

  for (const courseData of courses) {
    const existingCourse = await prisma.course.findFirst({
      where: {
        title: courseData.title
      }
    });

    if (existingCourse) {
      console.log(`Already exists: ${courseData.title}`);
      continue;
    }

    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        stage: 'EXECUTION',
        createdById: creator.id,
        modules: {
          create: courseData.modules.map((moduleTitle, index) => ({
            title: moduleTitle,
            sequenceOrder: index + 1,
            type: 'VIDEO',
            timeLimitMins: 30,
            passingScore: 70
          }))
        }
      },
      include: {
        modules: true
      }
    });

    console.log(
      `Created: ${course.title} (${course.modules.length} modules)`
    );
  }

  console.log('');
  console.log('Dummy recommendation data created successfully.');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });