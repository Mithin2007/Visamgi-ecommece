import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCustomer } from "@/server/auth";
import { db } from "@/server/db";
import { customerName } from "@/components/customer-presentation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export default async function Order({params}:{params:Promise<{id:string}>}){const user=await requireCustomer(),{id}=await params,order=await db.order.findFirst({where:{id,userId:user.id},include:{items:true}});if(!order)notFound();return <main><SiteHeader/><section className="order-detail shell"><Link className="text-link" href="/account/orders">← All orders</Link><p className="eyebrow">Order details</p><h1>{order.orderNumber}</h1><div className="order-detail__meta"><p>Placed {order.createdAt.toLocaleDateString()}</p><p><strong>{order.orderStatus}</strong> · Payment {order.paymentStatus}</p></div><div className="order-items">{order.items.map(item=><article key={item.id}><div><strong>{customerName(item.productNameSnapshot,"Heritage object")}</strong>{item.variantNameSnapshot&&<small>{item.variantNameSnapshot}</small>}</div><span>{item.quantity} × ₹{item.priceSnapshot.toString()}</span><strong>₹{item.subtotal.toString()}</strong></article>)}</div><div className="order-total"><span>Total</span><strong>₹{order.total.toString()}</strong></div></section><SiteFooter/></main>;}
