"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { loginAdmin } from "@/server/auth";
export async function login(_: { error: string }, formData: FormData): Promise<{error:string}> { const parsed=z.object({email:z.string().email(),password:z.string().min(1)}).safeParse(Object.fromEntries(formData)); if(!parsed.success) return {error:"Enter a valid email and password."}; if(!(await loginAdmin(parsed.data.email, parsed.data.password))) return {error:"Invalid administrator credentials."}; redirect("/admin/dashboard"); }
