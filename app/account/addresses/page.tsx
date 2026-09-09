import Link from "next/link";
import { requireCustomer } from "@/server/auth";
import { db } from "@/server/db";
import { deleteAddress, saveAddress } from "@/actions";
import { SiteHeader } from "@/components/site-header";

export default async function Addresses({searchParams}:{searchParams:Promise<{returnTo?:string}>}){
  const user=await requireCustomer(),{returnTo}=await searchParams,returnToCheckout=returnTo==="/checkout";
  const rows=await db.address.findMany({where:{userId:user.id},orderBy:{isDefault:"desc"}});
  return <main><SiteHeader/><section className="shop shell"><p className="eyebrow">Account</p><h1>Saved addresses.</h1>
    {returnToCheckout&&<div className="checkout-notice"><p>Add an address and we’ll take you straight back to delivery.</p><Link className="text-link" href="/checkout">Return to checkout</Link></div>}
    {rows.length?rows.map(address=><article className="cart-row" key={address.id}><span><strong>{address.fullName}{address.isDefault?" · Default":""}</strong><br/>{address.line1}, {address.city} — {address.pincode}</span><form action={deleteAddress}><input name="id" type="hidden" value={address.id}/><button>Remove</button></form></article>):<p className="empty-state">Save an address to make checkout feel effortless.</p>}
    <h2>Add an address</h2><form className="customer-form" action={saveAddress}><input type="hidden" name="returnTo" value={returnToCheckout?"/checkout":""}/><label>Full name<input name="fullName" required/></label><label>Phone<input name="phone" required/></label><label>Address line<input name="line1" required/></label><label>Address line 2<input name="line2"/></label><label>City<input name="city" required/></label><label>District<input name="district"/></label><label>State<input name="state" required/></label><label>Pincode<input name="pincode" inputMode="numeric" required/></label><label>Landmark<input name="landmark"/></label><label>Type<input name="type" placeholder="Home / Work"/></label><label><input name="isDefault" type="checkbox"/> Set as default</label><button className="button">Save address{returnToCheckout?" and return to checkout":""}</button></form>
  </section></main>;
}
