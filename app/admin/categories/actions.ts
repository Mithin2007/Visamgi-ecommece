"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { categoryInput, recordAudit } from "@/server/admin";
import { db } from "@/server/db";
const makeSlug=(value:FormDataEntryValue|null)=>String(value??"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
export async function createCategory(form:FormData){const admin=await requireAdmin(),name=form.get("name");const v=categoryInput.parse({name,slug:makeSlug(name),description:form.get("description")||null,imageUrl:null,published:form.get("published")==="on",sortOrder:form.get("sortOrder")||0});const category=await db.category.create({data:v});await recordAudit(admin.id,"CATEGORY_CREATED","Category",category.id);revalidatePath("/admin/categories");revalidatePath("/shop");}
export async function deleteCategory(form:FormData){const admin=await requireAdmin();const id=String(form.get("id"));const count=await db.product.count({where:{categoryId:id,archivedAt:null}});if(count) throw new Error("Categories with active products cannot be deleted.");await db.category.delete({where:{id}});await recordAudit(admin.id,"CATEGORY_DELETED","Category",id);revalidatePath("/admin/categories");}
