const prisma = require("./utils/prisma");

async function test() {
  try {
    const result = await prisma.$queryRawUnsafe(
      "SELECT current_database(), current_user"
    );

    console.log("PRISMA CONNECTED:", result);
  } catch (error) {
    console.error("PRISMA ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
