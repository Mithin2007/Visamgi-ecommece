import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 14) throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 14 characters before provisioning a local admin.");
  await db.user.upsert({ where: { email }, update: { passwordHash: await hash(password, 12), role: UserRole.ADMIN, active: true }, create: { email, passwordHash: await hash(password, 12), role: UserRole.ADMIN, active: true } });
}
main().finally(() => db.$disconnect());
