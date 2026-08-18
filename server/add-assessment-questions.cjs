const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in server/.env");
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const assessments = {
  "Machine Learning": {
    post: [
      {
        q: "What is supervised learning?",
        options: [
          "Learning from labeled data",
          "Learning without data",
          "Learning only from images",
          "Learning without a model"
        ],
        correct: "A"
      },
      {
        q: "Which algorithm is commonly used for classification?",
        options: [
          "Linear Regression",
          "Logistic Regression",
          "K-Means",
          "PCA"
        ],
        correct: "B"
      },
      {
        q: "What is overfitting?",
        options: [
          "Poor performance on training data",
          "Good performance on training data but poor performance on unseen data",
          "Having too little data",
          "Removing features"
        ],
        correct: "B"
      },
      {
        q: "What is the purpose of feature scaling?",
        options: [
          "To delete features",
          "To put features on comparable scales",
          "To increase database size",
          "To remove labels"
        ],
        correct: "B"
      },
      {
        q: "Which metric is commonly used for regression?",
        options: [
          "Mean Squared Error",
          "Accuracy",
          "Precision",
          "Recall"
        ],
        correct: "A"
      }
    ],
    standard: [
      {
        q: "What does cross-validation help estimate?",
        options: [
          "Database size",
          "Generalization performance",
          "File size",
          "Number of columns"
        ],
        correct: "B"
      },
      {
        q: "Which technique can reduce overfitting?",
        options: [
          "Regularization",
          "Deleting the test set",
          "Increasing noise",
          "Removing validation"
        ],
        correct: "A"
      },
      {
        q: "What does a confusion matrix evaluate?",
        options: [
          "Regression models",
          "Classification predictions",
          "Database queries",
          "File storage"
        ],
        correct: "B"
      },
      {
        q: "What is the main idea of a decision tree?",
        options: [
          "Randomly delete data",
          "Recursively split data based on features",
          "Convert images to videos",
          "Store passwords"
        ],
        correct: "B"
      },
      {
        q: "What does PCA primarily do?",
        options: [
          "Increase dimensionality",
          "Reduce dimensionality",
          "Create labels",
          "Train databases"
        ],
        correct: "B"
      }
    ]
  },

  "Deep Learning": {
    post: [
      {
        q: "What is a neural network made of?",
        options: [
          "Layers of interconnected neurons",
          "Only databases",
          "Only SQL queries",
          "Only images"
        ],
        correct: "A"
      },
      {
        q: "What is an activation function used for?",
        options: [
          "Introducing non-linearity",
          "Deleting neurons",
          "Saving files",
          "Creating databases"
        ],
        correct: "A"
      },
      {
        q: "Which activation function is commonly used in hidden layers?",
        options: [
          "ReLU",
          "SQL",
          "CSV",
          "HTML"
        ],
        correct: "A"
      },
      {
        q: "What does an epoch represent?",
        options: [
          "One complete pass through the training data",
          "One database table",
          "One neuron",
          "One image pixel"
        ],
        correct: "A"
      },
      {
        q: "What is backpropagation used for?",
        options: [
          "Computing gradients for updating weights",
          "Creating tables",
          "Displaying charts",
          "Compressing images"
        ],
        correct: "A"
      }
    ],
    standard: [
      {
        q: "What problem does dropout help address?",
        options: [
          "Overfitting",
          "Missing files",
          "SQL syntax",
          "Image resolution"
        ],
        correct: "A"
      },
      {
        q: "Which architecture is particularly useful for image data?",
        options: [
          "CNN",
          "SQL",
          "CSV",
          "FTP"
        ],
        correct: "A"
      },
      {
        q: "What does an optimizer do?",
        options: [
          "Updates model parameters to minimize loss",
          "Deletes training data",
          "Creates images",
          "Stores passwords"
        ],
        correct: "A"
      },
      {
        q: "What is vanishing gradient?",
        options: [
          "Gradients become extremely small during backpropagation",
          "Images become smaller",
          "The database becomes empty",
          "The model gains more layers"
        ],
        correct: "A"
      },
      {
        q: "Why are CNNs effective for images?",
        options: [
          "They learn spatial/local patterns using convolution",
          "They only use SQL",
          "They do not require training",
          "They remove all pixels"
        ],
        correct: "A"
      }
    ]
  },

  "SQL": {
    post: [
      {
        q: "What does SQL stand for?",
        options: [
          "Structured Query Language",
          "Simple Question Language",
          "System Query Logic",
          "Structured Question List"
        ],
        correct: "A"
      },
      {
        q: "Which command retrieves data?",
        options: [
          "SELECT",
          "INSERT",
          "DELETE",
          "UPDATE"
        ],
        correct: "A"
      },
      {
        q: "Which clause filters rows?",
        options: [
          "WHERE",
          "GROUP BY",
          "ORDER BY",
          "JOIN"
        ],
        correct: "A"
      },
      {
        q: "Which command adds a new row?",
        options: [
          "INSERT",
          "SELECT",
          "DROP",
          "ALTER"
        ],
        correct: "A"
      },
      {
        q: "Which keyword removes duplicate results?",
        options: [
          "DISTINCT",
          "UNIQUE ROW",
          "REMOVE",
          "FILTER"
        ],
        correct: "A"
      }
    ],
    standard: [
      {
        q: "What is a primary key?",
        options: [
          "A column that uniquely identifies each row",
          "A duplicate column",
          "A temporary table",
          "A database password"
        ],
        correct: "A"
      },
      {
        q: "Which JOIN returns matching rows from both tables?",
        options: [
          "INNER JOIN",
          "LEFT JOIN",
          "RIGHT JOIN",
          "FULL JOIN"
        ],
        correct: "A"
      },
      {
        q: "Which clause groups rows for aggregate calculations?",
        options: [
          "GROUP BY",
          "WHERE",
          "ORDER BY",
          "SELECT"
        ],
        correct: "A"
      },
      {
        q: "Which clause filters grouped results?",
        options: [
          "HAVING",
          "WHERE",
          "FROM",
          "JOIN"
        ],
        correct: "A"
      },
      {
        q: "What is database normalization mainly used for?",
        options: [
          "Reducing data redundancy",
          "Increasing duplicate data",
          "Deleting tables",
          "Increasing passwords"
        ],
        correct: "A"
      }
    ]
  },

  "Python": {
    post: [
      {
        q: "Which symbol starts a comment in Python?",
        options: [
          "#",
          "//",
          "/*",
          "<!--"
        ],
        correct: "A"
      },
      {
        q: "Which data type stores an ordered collection that can change?",
        options: [
          "list",
          "tuple",
          "string",
          "integer"
        ],
        correct: "A"
      },
      {
        q: "Which keyword defines a function?",
        options: [
          "def",
          "function",
          "func",
          "define"
        ],
        correct: "A"
      },
      {
        q: "What does len() return?",
        options: [
          "Number of items",
          "Largest value",
          "Smallest value",
          "Data type"
        ],
        correct: "A"
      },
      {
        q: "Which structure stores key-value pairs?",
        options: [
          "dictionary",
          "list",
          "tuple",
          "set"
        ],
        correct: "A"
      }
    ],
    standard: [
      {
        q: "What is a Python exception?",
        options: [
          "An error/event that interrupts normal execution",
          "A variable",
          "A loop",
          "A package"
        ],
        correct: "A"
      },
      {
        q: "Which block handles exceptions?",
        options: [
          "try/except",
          "if/else",
          "for/while",
          "def/return"
        ],
        correct: "A"
      },
      {
        q: "What is a list comprehension?",
        options: [
          "A compact way to create a list",
          "A database command",
          "A Python error",
          "A file format"
        ],
        correct: "A"
      },
      {
        q: "What is a lambda function?",
        options: [
          "An anonymous function",
          "A database",
          "A class",
          "A loop"
        ],
        correct: "A"
      },
      {
        q: "Which library is commonly used for numerical arrays?",
        options: [
          "NumPy",
          "Flask",
          "Django",
          "Requests"
        ],
        correct: "A"
      }
    ]
  },

  "Data Visualization": {
    post: [
      {
        q: "Which chart is useful for comparing categories?",
        options: [
          "Bar chart",
          "Line chart",
          "Histogram",
          "Scatter plot"
        ],
        correct: "A"
      },
      {
        q: "Which chart shows trends over time?",
        options: [
          "Line chart",
          "Pie chart",
          "Box plot",
          "Heatmap"
        ],
        correct: "A"
      },
      {
        q: "Which chart shows the distribution of numerical data?",
        options: [
          "Histogram",
          "Line chart",
          "Bar chart",
          "Area map"
        ],
        correct: "A"
      },
      {
        q: "What does the x-axis commonly represent?",
        options: [
          "Independent or category variable",
          "Only the title",
          "Database password",
          "Chart color"
        ],
        correct: "A"
      },
      {
        q: "Why are labels important in a visualization?",
        options: [
          "They make the chart easier to understand",
          "They increase file size",
          "They remove data",
          "They hide values"
        ],
        correct: "A"
      }
    ],
    standard: [
      {
        q: "Which chart is useful for showing correlation between two numerical variables?",
        options: [
          "Scatter plot",
          "Pie chart",
          "Bar chart",
          "Histogram"
        ],
        correct: "A"
      },
      {
        q: "What does a box plot help show?",
        options: [
          "Distribution and outliers",
          "Only categories",
          "Database relationships",
          "Source code"
        ],
        correct: "A"
      },
      {
        q: "What is misleading visualization?",
        options: [
          "A chart that gives an inaccurate impression of the data",
          "A chart with labels",
          "A simple chart",
          "A chart with a title"
        ],
        correct: "A"
      },
      {
        q: "Why should unnecessary chart decoration be avoided?",
        options: [
          "It can distract from the data",
          "It increases accuracy",
          "It improves SQL",
          "It creates more rows"
        ],
        correct: "A"
      },
      {
        q: "What is a heatmap commonly used for?",
        options: [
          "Showing values or intensity across a matrix",
          "Writing Python code",
          "Creating databases",
          "Training neural networks"
        ],
        correct: "A"
      }
    ]
  },

  "Math for Data Science": {
    post: [
      {
        q: "What is the mean?",
        options: [
          "Sum of values divided by number of values",
          "Largest value",
          "Smallest value",
          "Middle value only"
        ],
        correct: "A"
      },
      {
        q: "What does variance measure?",
        options: [
          "Spread of data around the mean",
          "Number of rows",
          "Number of columns",
          "Maximum value"
        ],
        correct: "A"
      },
      {
        q: "What is a vector?",
        options: [
          "An ordered collection of numerical values",
          "A database table",
          "A chart",
          "A Python package"
        ],
        correct: "A"
      },
      {
        q: "What does probability measure?",
        options: [
          "Likelihood of an event",
          "Data size",
          "File size",
          "Number of features"
        ],
        correct: "A"
      },
      {
        q: "What is a derivative?",
        options: [
          "Rate of change",
          "Average value",
          "Total value",
          "Maximum value"
        ],
        correct: "A"
      }
    ],
    standard: [
      {
        q: "What does standard deviation measure?",
        options: [
          "Typical spread around the mean",
          "Number of observations",
          "Maximum value",
          "Minimum value"
        ],
        correct: "A"
      },
      {
        q: "What is matrix multiplication used for in machine learning?",
        options: [
          "Linear transformations and computations",
          "Creating passwords",
          "Displaying web pages",
          "Deleting datasets"
        ],
        correct: "A"
      },
      {
        q: "What does covariance describe?",
        options: [
          "How two variables change together",
          "The number of rows",
          "The maximum value",
          "The median"
        ],
        correct: "A"
      },
      {
        q: "What is gradient descent?",
        options: [
          "An optimization method that moves toward lower loss",
          "A visualization method",
          "A database command",
          "A programming language"
        ],
        correct: "A"
      },
      {
        q: "What does correlation measure?",
        options: [
          "Strength and direction of a linear relationship",
          "Database size",
          "Number of features",
          "Image resolution"
        ],
        correct: "A"
      }
    ]
  },

  "Computer Vision": {
    post: [
      {
        q: "What is computer vision?",
        options: [
          "A field concerned with understanding images and video using computers",
          "A database language",
          "A programming syntax",
          "A spreadsheet tool"
        ],
        correct: "A"
      },
      {
        q: "What is an image pixel?",
        options: [
          "A small element representing image information",
          "A database row",
          "A Python function",
          "A neural network"
        ],
        correct: "A"
      },
      {
        q: "Which model is commonly used for image classification?",
        options: [
          "CNN",
          "SQL",
          "CSV",
          "HTML"
        ],
        correct: "A"
      },
      {
        q: "What is image classification?",
        options: [
          "Assigning a label to an image",
          "Deleting an image",
          "Compressing a database",
          "Writing SQL"
        ],
        correct: "A"
      },
      {
        q: "What is image preprocessing?",
        options: [
          "Preparing images before model processing",
          "Creating SQL queries",
          "Deleting labels",
          "Writing Python comments"
        ],
        correct: "A"
      }
    ],
    standard: [
      {
        q: "What is object detection?",
        options: [
          "Locating and classifying objects in an image",
          "Changing database rows",
          "Creating a Python function",
          "Removing all pixels"
        ],
        correct: "A"
      },
      {
        q: "What is image segmentation?",
        options: [
          "Assigning labels to image regions or pixels",
          "Sorting database rows",
          "Creating charts",
          "Writing SQL"
        ],
        correct: "A"
      },
      {
        q: "What does convolution do in a CNN?",
        options: [
          "Extracts local or spatial features",
          "Deletes images",
          "Creates SQL tables",
          "Stores passwords"
        ],
        correct: "A"
      },
      {
        q: "Why is data augmentation used?",
        options: [
          "To create varied training examples and improve generalization",
          "To delete training examples",
          "To reduce all images to zero",
          "To create databases"
        ],
        correct: "A"
      },
      {
        q: "What is transfer learning?",
        options: [
          "Reusing a pretrained model for a new task",
          "Moving database rows",
          "Changing image format only",
          "Deleting model weights"
        ],
        correct: "A"
      }
    ]
  }
};

async function findOrCreateCourse(title) {
  let course = await prisma.course.findFirst({
    where: { title }
  });

  if (!course) {
    const user = await prisma.user.findFirst({
      orderBy: { id: "asc" }
    });

    if (!user) {
      throw new Error(
        `No user found. Create/register an LMS user first.`
      );
    }

    course = await prisma.course.create({
      data: {
        title,
        description: `${title} course`,
        stage: "PLANNING",
        timeLimitMins: 90,
        createdById: user.id
      }
    });

    console.log(`✅ Created course: ${title}`);
  }

  return course;
}

async function findAssessmentModule(courseId, type, possibleTitles) {
  let module = await prisma.module.findFirst({
    where: {
      courseId,
      type
    },
    orderBy: {
      sequenceOrder: "asc"
    }
  });

  if (!module) {
    module = await prisma.module.findFirst({
      where: {
        courseId,
        title: {
          in: possibleTitles
        }
      },
      orderBy: {
        sequenceOrder: "asc"
      }
    });
  }

  return module;
}

async function createAssessmentModule(courseId, title, type, sequenceOrder) {
  return prisma.module.create({
    data: {
      courseId,
      title,
      sequenceOrder,
      type,
      timeLimitMins: 15,
      passingScore: 60
    }
  });
}

async function insertQuestions(moduleId, questions) {
  let inserted = 0;
  let skipped = 0;

  for (const item of questions) {
    const existing = await prisma.question.findFirst({
      where: {
        moduleId,
        questionText: item.q
      }
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.question.create({
      data: {
        moduleId,
        questionText: item.q,
        optionsJson: JSON.stringify(item.options),
        correctOption: item.correct
      }
    });

    inserted++;
  }

  return { inserted, skipped };
}

async function main() {
  console.log("");
  console.log("==========================================");
  console.log(" LMS ASSESSMENT QUESTION INSTALLER");
  console.log("==========================================");
  console.log("");

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const [courseTitle, data] of Object.entries(assessments)) {
    const course = await findOrCreateCourse(courseTitle);

    let postModule = await findAssessmentModule(
      course.id,
      "POST_ASSESSMENT",
      [
        "Post Assessment",
        `${courseTitle} Post Assessment`,
        "Model Evaluation"
      ]
    );

    if (!postModule) {
      postModule = await createAssessmentModule(
        course.id,
        "Post Assessment",
        "POST_ASSESSMENT",
        6
      );
      console.log(`  ✅ Created Post Assessment module`);
    }

    let standardModule = await findAssessmentModule(
      course.id,
      "STANDARD_ASSESSMENT",
      [
        "Standard Assessment",
        `${courseTitle} Standard Assessment`,
        "Assessment"
      ]
    );

    if (!standardModule) {
      standardModule = await createAssessmentModule(
        course.id,
        "Standard Assessment",
        "STANDARD_ASSESSMENT",
        7
      );
      console.log(`  ✅ Created Standard Assessment module`);
    }

    const postResult = await insertQuestions(
      postModule.id,
      data.post
    );

    const standardResult = await insertQuestions(
      standardModule.id,
      data.standard
    );

    totalInserted +=
      postResult.inserted + standardResult.inserted;

    totalSkipped +=
      postResult.skipped + standardResult.skipped;

    console.log(
      `📚 ${courseTitle}: ` +
      `Post +${postResult.inserted}/-${postResult.skipped}, ` +
      `Standard +${standardResult.inserted}/-${standardResult.skipped}`
    );
  }

  console.log("");
  console.log("==========================================");
  console.log(`✅ Questions inserted: ${totalInserted}`);
  console.log(`⏭️ Questions already existing: ${totalSkipped}`);
  console.log("==========================================");
  console.log("");
  console.log("Database update completed successfully.");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ DATABASE UPDATE FAILED");
    console.error("");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });