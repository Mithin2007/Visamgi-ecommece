"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { adjustStock } from "@/server/admin";
export async function adjust(form:FormData){const admin=await requireAdmin();await adjustStock(admin.id,String(form.get("productId")),Number(form.get("delta")),String(form.get("note")||""));revalidatePath("/admin/inventory");revalidatePath("/admin/dashboard");}
