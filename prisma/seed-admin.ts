// prisma/seed-admin.ts
// Run with: npx ts-node --project tsconfig.json -e "require('./prisma/seed-admin.ts')"
// OR simply: npx tsx prisma/seed-admin.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@mechart3d.com";
  const password = "Admin@1234";
  const name = "Super Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Upgrade to SUPER_ADMIN if already exists
    await prisma.user.update({
      where: { email },
      data: { role: "SUPER_ADMIN" },
    });
    console.log(`✅ Existing user upgraded to SUPER_ADMIN: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hash,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Super Admin created successfully!");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   ⚠️  Change the password after first login!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
