"use server";
import { redirect } from "next/navigation";
import { requireCustomer } from "@/server/auth";
import { checkout } from "@/server/checkout";
export async function placeOrder(f:FormData){const user=await requireCustomer();const order=await checkout(user.id,String(f.get("addressId")),f.get("paymentMethod")==="COD"?"COD":"RAZORPAY",String(f.get("checkoutToken")));redirect(`/account/orders/${order.id}`);}
