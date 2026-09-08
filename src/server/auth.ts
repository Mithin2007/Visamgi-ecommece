import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import { compare, hash as hashPassword } from "bcryptjs";
import { db } from "@/server/db";

const COOKIE = "visamgi_admin_session";
const CUSTOMER_COOKIE = "visamgi_customer_session";
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

async function startSession(userId:string, cookieName:string) { const token=randomBytes(32).toString("base64url"); await db.$transaction([db.session.deleteMany({where:{userId}}),db.session.create({data:{userId,tokenHash:hash(token),expiresAt:new Date(Date.now()+maxAge*1000)}})]); (await cookies()).set(cookieName,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge,path:"/"}); }
export async function registerCustomer(name:string,email:string,password:string){const existing=await db.user.findUnique({where:{email:email.toLowerCase()}});if(existing) return false;const user=await db.user.create({data:{name,email:email.toLowerCase(),passwordHash:await hashPassword(password,12),role:"CUSTOMER"}});await startSession(user.id,CUSTOMER_COOKIE);return true;}
export async function loginCustomer(email:string,password:string){const user=await db.user.findUnique({where:{email:email.toLowerCase()}});if(!user||!user.active||user.role!=="CUSTOMER"||!(await compare(password,user.passwordHash)))return false;await startSession(user.id,CUSTOMER_COOKIE);return true;}
export async function currentCustomer(){const token=(await cookies()).get(CUSTOMER_COOKIE)?.value;if(!token)return null;const session=await db.session.findUnique({where:{tokenHash:hash(token)},include:{user:true}});if(!session||session.expiresAt<new Date()||!session.user.active||session.user.role!=="CUSTOMER")return null;return session.user;}
export async function requireCustomer(){const user=await currentCustomer();if(!user)redirect("/login");return user;}
export async function logoutCustomer(){const jar=await cookies(),token=jar.get(CUSTOMER_COOKIE)?.value;if(token)await db.session.deleteMany({where:{tokenHash:hash(token)}});jar.delete(CUSTOMER_COOKIE);}

export async function logoutAdmin() { const jar = await cookies(); const token = jar.get(COOKIE)?.value; if (token) await db.session.deleteMany({ where: { tokenHash: hash(token) } }); jar.delete(COOKIE); }

export async function currentAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date() || !session.user.active || session.user.role !== "ADMIN") return null;
  return session.user;
}
export async function requireAdmin() { const user = await currentAdmin(); if (!user) redirect("/admin/login"); return user; }
