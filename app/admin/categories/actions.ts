"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { categoryInput, recordAudit } from "@/server/admin";
import { db } from "@/server/db";
export async function createCategory(form:FormData){const admin=await requireAdmin();const v=categoryInput.parse({name:form.get("name"),slug:form.get("slug"),description:form.get("description")||null,imageUrl:form.get("imageUrl")||null,published:form.get("published")==="on",sortOrder:form.get("sortOrder")||0});const category=await db.category.create({data:v});await recordAudit(admin.id,"CATEGORY_CREATED","Category",category.id);revalidatePath("/admin/categories");}
export async function deleteCategory(form:FormData){const admin=await requireAdmin();const id=String(form.get("id"));const count=await db.product.count({where:{categoryId:id,archivedAt:null}});if(count) throw new Error("Categories with active products cannot be deleted.");await db.category.delete({where:{id}});await recordAudit(admin.id,"CATEGORY_DELETED","Category",id);revalidatePath("/admin/categories");}
