require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const courseData = [
  {
    title: "Machine Learning",
    description: "Learn machine learning fundamentals and practical model building.",
    timeLimitMins: 90,
    modules: [
      ["Introduction to Machine Learning", "VIDEO"],
      ["Data Preprocessing", "VIDEO"],
      ["Linear Regression", "PDF"],
      ["Classification Algorithms", "VIDEO"],
      ["Decision Trees", "PDF"],
      ["Model Evaluation", "POST_ASSESSMENT"],
    ],
  },

  {
    title: "Deep Learning",
    description: "Learn deep learning, neural networks and modern architectures.",
    timeLimitMins: 90,
    modules: [
      ["Introduction to Deep Learning", "VIDEO"],
      ["Neural Networks Fundamentals", "VIDEO"],
      ["Backpropagation", "PDF"],
      ["Convolutional Neural Networks", "VIDEO"],
      ["Recurrent Neural Networks", "PDF"],
      ["Deep Learning Assessment", "POST_ASSESSMENT"],
    ],
  },

  {
    title: "SQL",
    description: "Learn SQL and database fundamentals.",
    timeLimitMins: 60,
    modules: [
      ["SQL Fundamentals", "VIDEO"],
      ["SELECT Queries", "VIDEO"],
      ["Filtering with WHERE", "PDF"],
      ["JOINs", "VIDEO"],
      ["GROUP BY and Aggregations", "PDF"],
      ["SQL Assessment", "POST_ASSESSMENT"],
    ],
  },

  {
    title: "Python",
    description: "Learn Python programming for data science and machine learning.",
    timeLimitMins: 90,
    modules: [
      ["Python Basics", "VIDEO"],
      ["Variables and Data Types", "PDF"],
      ["Conditions and Loops", "VIDEO"],
      ["Functions", "PDF"],
      ["Lists, Tuples and Dictionaries", "VIDEO"],
      ["Python Assessment", "POST_ASSESSMENT"],
    ],
  },

  {
    title: "Data Visualization",
    description: "Learn how to analyze and visualize data effectively.",
    timeLimitMins: 60,
    modules: [
      ["Introduction to Data Visualization", "VIDEO"],
      ["Charts and Graphs", "PDF"],
      ["Matplotlib Basics", "VIDEO"],
      ["Seaborn Basics", "VIDEO"],
      ["Interactive Visualizations", "PDF"],
      ["Visualization Assessment", "POST_ASSESSMENT"],
    ],
  },

  {
    title: "Math for Data Science",
    description: "Learn the mathematics required for data science and machine learning.",
    timeLimitMins: 90,
    modules: [
      ["Mathematics Fundamentals", "VIDEO"],
      ["Linear Algebra", "PDF"],
      ["Vectors and Matrices", "VIDEO"],
      ["Probability", "PDF"],
      ["Statistics", "VIDEO"],
      ["Math Assessment", "POST_ASSESSMENT"],
    ],
  },

  {
    title: "Computer Vision",
    description: "Learn computer vision fundamentals and image processing.",
    timeLimitMins: 90,
    modules: [
      ["Introduction to Computer Vision", "VIDEO"],
      ["Digital Images and Pixels", "PDF"],
      ["Image Processing", "VIDEO"],
      ["Feature Detection", "PDF"],
      ["Object Detection", "VIDEO"],
      ["Computer Vision Assessment", "POST_ASSESSMENT"],
    ],
  },
];

async function main() {
  console.log("Starting course setup...\n");

  // Get an existing user to use as course creator.
  const creator = await prisma.user.findFirst({
    orderBy: { id: "asc" },
  });

  if (!creator) {
    throw new Error(
      "No user found in database. Please register an admin/user first."
    );
  }

  console.log(`Using user ID ${creator.id} (${creator.name}) as course creator.\n`);

  for (const data of courseData) {
    // Find existing course by title.
    let course = await prisma.course.findFirst({
      where: {
        title: data.title,
      },
    });

    // Create course if it doesn't exist.
    if (!course) {
      course = await prisma.course.create({
        data: {
          title: data.title,
          description: data.description,
          stage: "PLANNING",
          timeLimitMins: data.timeLimitMins,
          createdById: creator.id,
        },
      });

      console.log(`Created course: ${course.title}`);
    } else {
      console.log(`Course already exists: ${course.title}`);
    }

    // Check existing modules.
    const existingModules = await prisma.module.findMany({
      where: {
        courseId: course.id,
      },
      orderBy: {
        sequenceOrder: "asc",
      },
    });

    // Create missing modules.
    for (let i = 0; i < data.modules.length; i++) {
      const [moduleTitle, moduleType] = data.modules[i];

      const alreadyExists = existingModules.some(
        (m) => m.title === moduleTitle
      );

      if (!alreadyExists) {
        await prisma.module.create({
          data: {
            courseId: course.id,
            title: moduleTitle,
            sequenceOrder: i + 1,
            type: moduleType,
            timeLimitMins: 15,
            passingScore: moduleType.includes("ASSESSMENT") ? 70 : null,
          },
        });

        console.log(`   + Module: ${moduleTitle}`);
      }
    }

    const totalModules = await prisma.module.count({
      where: {
        courseId: course.id,
      },
    });

    console.log(`   Total modules: ${totalModules}\n`);
  }

  console.log("======================================");
  console.log("COURSE SETUP COMPLETED SUCCESSFULLY");
  console.log("======================================");

  const courses = await prisma.course.findMany({
    include: {
      _count: {
        select: {
          modules: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  console.table(
    courses.map((course) => ({
      ID: course.id,
      Course: course.title,
      Modules: course._count.modules,
    }))
  );
}

main()
  .catch((error) => {
    console.error("\nERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });