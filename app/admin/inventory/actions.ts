"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { adjustStock } from "@/server/admin";
export type StockAdjustmentState={error:string;success:string};
export async function adjust(_:StockAdjustmentState,form:FormData):Promise<StockAdjustmentState>{const admin=await requireAdmin(),delta=Number(form.get("delta"));if(!Number.isInteger(delta)||delta===0)return{error:"Enter a whole number other than zero.",success:""};try{await adjustStock(admin.id,String(form.get("productId")),delta,String(form.get("note")||""));revalidatePath("/admin/inventory");revalidatePath("/admin/dashboard");revalidatePath("/");revalidatePath("/shop");revalidatePath("/shop/product/[slug]","page");return{error:"",success:"Stock updated."};}catch(error){return{error:error instanceof Error?error.message:"Stock could not be updated.",success:""};}}
