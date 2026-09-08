"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { loginCustomer, logoutCustomer, registerCustomer, requireCustomer } from "@/server/auth";
import { addCartItem, changeCartQuantity, removeCartItem } from "@/server/cart";
import { db } from "@/server/db";
const credentials=z.object({email:z.string().email(),password:z.string().min(10),name:z.string().trim().min(2).max(120)});
export async function register(_: {error:string},f:FormData){const v=credentials.safeParse(Object.fromEntries(f));if(!v.success)return{error:"Enter a valid name, email, and password of at least 10 characters."};if(!await registerCustomer(v.data.name,v.data.email,v.data.password))return{error:"Unable to create this account."};redirect("/account");}
export async function login(_: {error:string},f:FormData){const email=z.string().email().safeParse(f.get("email")),password=String(f.get("password")||"");if(!email.success||!password)return{error:"Invalid email or password."};if(!await loginCustomer(email.data,password))return{error:"Invalid email or password."};redirect("/account");}
export async function logout(){await logoutCustomer();redirect("/");}
export async function addToCart(f:FormData){const user=await requireCustomer();await addCartItem(user.id,String(f.get("productId")),String(f.get("variantId")||"")||undefined,Number(f.get("quantity")));revalidatePath("/cart");}
export async function updateCart(f:FormData){const user=await requireCustomer();await changeCartQuantity(user.id,String(f.get("itemId")),Number(f.get("quantity")));revalidatePath("/cart");}
export async function removeCart(f:FormData){const user=await requireCustomer();await removeCartItem(user.id,String(f.get("itemId")));revalidatePath("/cart");}
const address=z.object({fullName:z.string().min(2),phone:z.string().regex(/^[0-9+\- ]{8,18}$/),line1:z.string().min(4),line2:z.string().optional(),city:z.string().min(2),district:z.string().optional(),state:z.string().min(2),pincode:z.string().regex(/^\d{6}$/),landmark:z.string().optional(),type:z.string().optional()});
export async function saveAddress(f:FormData){const user=await requireCustomer(),v=address.parse(Object.fromEntries(f)),id=String(f.get("id")||"");await db.$transaction(async tx=>{const current=id?await tx.address.findFirst({where:{id,userId:user.id}}):null;if(id&&!current)throw new Error("Address not found.");const data={...v,isDefault:f.get("isDefault")==="on",userId:user.id};if(data.isDefault)await tx.address.updateMany({where:{userId:user.id},data:{isDefault:false}});if(current)await tx.address.update({where:{id},data});else await tx.address.create({data});});revalidatePath("/account/addresses");}
export async function deleteAddress(f:FormData){const user=await requireCustomer(),id=String(f.get("id")),row=await db.address.findFirst({where:{id,userId:user.id}});if(!row)throw new Error("Address not found.");await db.address.delete({where:{id}});revalidatePath("/account/addresses");}
