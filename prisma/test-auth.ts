import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testAuth(email: string, password: string) {
  console.log(`\n🔐 Testing login: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    console.log("❌ User not found in DB");
    return;
  }

  console.log("✅ User found:", { id: user.id, role: user.role, hasHash: !!user.passwordHash });

  if (!user.passwordHash) {
    console.log("❌ No password hash — user may have been created via Google OAuth only");
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  console.log(ok ? "✅ Password CORRECT" : "❌ Password WRONG");
}

async function main() {
  await testAuth("admin@mechart3d.com", "Admin@1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
