const prisma = require('./utils/prisma');
const bcrypt = require('bcrypt');

async function main() {
  console.log("Seeding initial data...");

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Admin123!", salt);

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { erpId: '111111' },
    update: { role: 'ADMIN' },
    create: {
      name: 'System Admin',
      erpId: '111111',
      passwordHash,
      designation: 'IT Director',
      region: 'RHO Islamabad',
      role: 'ADMIN'
    }
  });

  // 2. Create Moderator User
  const moderator = await prisma.user.upsert({
    where: { erpId: '222222' },
    update: { role: 'MODERATOR' },
    create: {
      name: 'System Moderator',
      erpId: '222222',
      passwordHash,
      designation: 'Training Manager',
      region: 'RHO Lahore',
      role: 'MODERATOR'
    }
  });

  console.log("Created Admin (111111) and Moderator (222222)");

  // 3. Create a sample course if none exists
  const courseCount = await prisma.course.count();
  if (courseCount === 0) {
    const course = await prisma.course.create({
      data: {
        title: 'Cybersecurity Awareness Training',
        description: 'Mandatory annual cybersecurity training for all LMS employees.',
        stage: 'EXECUTION',
        timeLimitMins: 60,
        createdById: admin.id,
        modules: {
          create: [
            {
              title: 'Introduction to Phishing',
              sequenceOrder: 1,
              type: 'VIDEO',
              contentUrl: 'https://www.youtube.com/embed/Y7zNaCwwOE8' // placeholder
            },
            {
              title: 'LMS Security Guidelines',
              sequenceOrder: 2,
              type: 'PDF',
              contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // placeholder
            }
          ]
        }
      }
    });
    console.log(`Created sample course: ${course.title}`);
  } else {
    console.log("Courses already exist, skipping course creation.");
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
