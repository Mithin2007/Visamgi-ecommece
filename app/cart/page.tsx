import Link from "next/link";
import { requireCustomer } from "@/server/auth";
import { db } from "@/server/db";
import { cartTotal } from "@/server/cart";
import { SiteHeader } from "@/components/site-header";
import { CartItemControls } from "@/components/cart-item-controls";

export default async function Cart(){
  const user=await requireCustomer();
  const cart=await db.cart.findFirst({where:{userId:user.id,status:"ACTIVE"},include:{items:{include:{product:{include:{variants:true}}}}}});
  const items=cart?.items??[],total=cartTotal(items);
  return <main><SiteHeader/><section className="shop shell"><p className="eyebrow">Your bag</p><h1>Collected pieces.</h1>{items.length?items.map(item=>{const variant=item.variantId?item.product.variants.find(value=>value.id===item.variantId):null;const price=variant?.price??item.product.salePrice??item.product.price;const available=(variant?.stockQuantity??item.product.stockQuantity)>=item.quantity;return <article className="cart-row" key={item.id}><span><strong>{item.product.name}{variant&&` · ${variant.name}`}</strong><small>{available?"Available to order.":"Availability changed — update your bag before checkout."}</small></span><span>₹{price.toString()} each<br/><strong>₹{price.mul(item.quantity).toString()}</strong></span><CartItemControls itemId={item.id} quantity={item.quantity}/></article>}):<p className="empty-state">Your bag is waiting for its first object.</p>}<h2>Subtotal · ₹{total.toString()}</h2><Link className="button" href="/shop">Continue shopping</Link>{items.length>0&&<Link className="button" href="/checkout">Checkout</Link>}</section></main>;
}
