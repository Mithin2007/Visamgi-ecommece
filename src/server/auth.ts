import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import { compare } from "bcryptjs";
import { db } from "@/server/db";

const COOKIE = "visamgi_admin_session";
const maxAge = 60 * 60 * 8;
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function loginAdmin(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.active || user.role !== "ADMIN" || !(await compare(password, user.passwordHash))) return false;
  const token = randomBytes(32).toString("base64url");
  await db.$transaction([db.session.deleteMany({ where: { userId: user.id } }), db.session.create({ data: { userId: user.id, tokenHash: hash(token), expiresAt: new Date(Date.now() + maxAge * 1000) } }), db.auditLog.create({ data: { actorId: user.id, action: "ADMIN_LOGIN", entityType: "User", entityId: user.id } })]);
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge, path: "/" });
  return true;
}

export async function logoutAdmin() { const jar = await cookies(); const token = jar.get(COOKIE)?.value; if (token) await db.session.deleteMany({ where: { tokenHash: hash(token) } }); jar.delete(COOKIE); }

export async function currentAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date() || !session.user.active || session.user.role !== "ADMIN") return null;
  return session.user;
}
export async function requireAdmin() { const user = await currentAdmin(); if (!user) redirect("/admin/login"); return user; }
