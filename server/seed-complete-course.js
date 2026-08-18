const prisma = require('./utils/prisma');

async function main() {
  console.log("Seeding complete course...");

  // Assume Admin is user 1, or find first admin
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'System Admin',
        erpId: '999999',
        designation: 'Administrator',
        region: 'RHO Islamabad',
        passwordHash: 'dummyhash',
        role: 'ADMIN'
      }
    });
  }

  // Check if course already exists
  const existingCourse = await prisma.course.findFirst({
    where: { title: "Information Security Fundamentals" }
  });

  if (existingCourse) {
    console.log("Course 'Information Security Fundamentals' already exists. Cleaning up old modules...");
    // Delete old modules
    const oldModules = await prisma.module.findMany({ where: { courseId: existingCourse.id } });
    for (const m of oldModules) {
      await prisma.question.deleteMany({ where: { moduleId: m.id } });
      await prisma.progress.deleteMany({ where: { moduleId: m.id } });
      await prisma.reward.deleteMany({ where: { moduleId: m.id } });
      await prisma.module.delete({ where: { id: m.id } });
    }
  }

  const course = existingCourse || await prisma.course.create({
    data: {
      title: "Information Security Fundamentals",
      description: "A comprehensive guide to understanding basic information security principles, avoiding phishing, and adhering to LMS policies.",
      timeLimitMins: 60,
      stage: 'EXECUTION',
      createdById: admin.id
    }
  });

  // Module 1: Pre-Assessment
  console.log("Creating Module 1: Pre-Assessment...");
  await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Pre-Course Knowledge Check",
      sequenceOrder: 1,
      type: "PRE_ASSESSMENT",
      timeLimitMins: 10,
      passingScore: 0, // Pre-assessment doesn't usually require a strict passing score, just completion
      questions: {
        create: [
          {
            questionText: "What is the primary goal of phishing?",
            optionsJson: JSON.stringify([
              "To improve network speeds",
              "To steal sensitive information like passwords",
              "To update software automatically",
              "To clean viruses from a computer"
            ]),
            correctOption: "To steal sensitive information like passwords"
          },
          {
            questionText: "Which of the following is considered a strong password?",
            optionsJson: JSON.stringify([
              "password123",
              "admin",
              "N@drA!2026_sec",
              "12345678"
            ]),
            correctOption: "N@drA!2026_sec"
          }
        ]
      }
    }
  });

  // Module 2: Video
  console.log("Creating Module 2: Video...");
  await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Introduction to Cybersecurity",
      contentUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", // Placeholder video
      sequenceOrder: 2,
      type: "VIDEO",
      timeLimitMins: 15
    }
  });

  // Module 3: PDF
  console.log("Creating Module 3: PDF...");
  await prisma.module.create({
    data: {
      courseId: course.id,
      title: "LMS IT Security Policy",
      contentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Valid placeholder PDF
      sequenceOrder: 3,
      type: "PDF",
      timeLimitMins: 20
    }
  });

  // Module 4: Post-Assessment
  console.log("Creating Module 4: Post-Assessment...");
  await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Final Certification Exam",
      sequenceOrder: 4,
      type: "POST_ASSESSMENT",
      timeLimitMins: 15,
      passingScore: 100, // Strict passing score for cert
      questions: {
        create: [
          {
            questionText: "If you receive a suspicious email asking for your ERP credentials, what should you do?",
            optionsJson: JSON.stringify([
              "Reply and ask if they are legitimate",
              "Forward it to a friend",
              "Report it immediately to the IT Helpdesk and do NOT click any links",
              "Delete it and ignore it completely"
            ]),
            correctOption: "Report it immediately to the IT Helpdesk and do NOT click any links"
          },
          {
            questionText: "Which of the following is NOT a best practice for physical security at the office?",
            optionsJson: JSON.stringify([
              "Locking your computer screen when walking away",
              "Leaving sensitive printed documents on your desk overnight",
              "Wearing your official ID badge at all times",
              "Not holding the secure door open for strangers"
            ]),
            correctOption: "Leaving sensitive printed documents on your desk overnight"
          }
        ]
      }
    }
  });

  console.log("✅ Seed completed successfully! Course is ready.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
