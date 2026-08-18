const prisma = require('./utils/prisma');
async function main() {
  const users = await prisma.user.findMany({ where: { otpCode: { not: null } } });
  console.log('\n--- OTP CODES ---');
  users.forEach(u => console.log(`ERP ID: ${u.erpId} -> OTP: ${u.otpCode}`));
  console.log('-----------------\n');
}
main().finally(() => process.exit(0));
