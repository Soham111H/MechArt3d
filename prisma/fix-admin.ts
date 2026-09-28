import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Check if admin exists
  const user = await prisma.user.findUnique({
    where: { email: "admin@mechart3d.com" },
    select: { id: true, email: true, role: true, name: true, passwordHash: true },
  });

  if (!user) {
    console.log("❌ Admin user NOT found. Creating now...");
    const hash = await bcrypt.hash("Admin@1234", 12);
    await prisma.user.create({
      data: {
        email:         "admin@mechart3d.com",
        name:          "Super Admin",
        passwordHash:  hash,
        role:          "SUPER_ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log("✅ Admin created!");
    console.log("   Email:    admin@mechart3d.com");
    console.log("   Password: Admin@1234");
  } else {
    console.log("✅ Admin user found:");
    console.log("   ID:   ", user.id);
    console.log("   Email:", user.email);
    console.log("   Role: ", user.role);
    console.log("   Name: ", user.name);
    console.log("   Hash: ", user.passwordHash ? "[EXISTS]" : "❌ MISSING — fixing...");

    // Fix: reset password and role
    const hash = await bcrypt.hash("Admin@1234", 12);
    await prisma.user.update({
      where: { email: "admin@mechart3d.com" },
      data: {
        passwordHash:  hash,
        role:          "SUPER_ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log("✅ Password reset to Admin@1234 and role set to SUPER_ADMIN");
  }

  // Verify password works
  const updated = await prisma.user.findUnique({
    where: { email: "admin@mechart3d.com" },
    select: { passwordHash: true },
  });
  if (updated?.passwordHash) {
    const ok = await bcrypt.compare("Admin@1234", updated.passwordHash);
    console.log("\n🔐 Password verification:", ok ? "✅ PASS" : "❌ FAIL");
  }
}

main()
  .catch((e) => console.error("Error:", e))
  .finally(() => prisma.$disconnect());
