import { randomUUID } from "crypto";
import Link from "next/link";
import { requireCustomer } from "@/server/auth";
import { db } from "@/server/db";
import { getCheckoutQuote } from "@/server/checkout";
import { SiteHeader } from "@/components/site-header";
import { CheckoutOrderForm } from "@/components/checkout-order-form";

type CheckoutPageProps={searchParams:Promise<{addressId?:string}>};

export default async function Checkout({searchParams}:CheckoutPageProps){
  const user=await requireCustomer();
  const {addressId}=await searchParams;
  const [addresses,activeCart]=await Promise.all([
    db.address.findMany({where:{userId:user.id},orderBy:{isDefault:"desc"}}),
    db.cart.findFirst({where:{userId:user.id,status:"ACTIVE"},include:{items:true}}),
  ]);
  if(!activeCart?.items.length)return <main><SiteHeader/><section className="shop shell"><p className="eyebrow">Checkout</p><h1>Your bag is empty.</h1><Link className="button" href="/shop">Explore collection</Link></section></main>;

  let quote:null|Awaited<ReturnType<typeof getCheckoutQuote>>=null;
  let quoteError="";
  if(addressId){try{quote=await getCheckoutQuote(user.id,addressId);}catch(error){quoteError=error instanceof Error?error.message:"Choose a delivery address to continue.";}}

  return <main><SiteHeader/><section className="checkout shell"><p className="eyebrow">Checkout</p><h1>One final step.</h1>
    <section className="checkout-step"><p className="eyebrow">Step 1</p><h2>Delivery address</h2>
      {addresses.length?<form action="/checkout" className="checkout-addresses">{addresses.map((address,index)=><label className={address.id===addressId?"address-option selected":"address-option"} key={address.id}><input type="radio" name="addressId" value={address.id} defaultChecked={address.id===addressId} required={index===0}/><span><strong>{address.fullName}{address.isDefault?" · Default":""}</strong><small>{address.line1}, {address.city}, {address.state} — {address.pincode}</small></span></label>)}<button className="button">Continue to delivery</button></form>:<div className="checkout-notice"><p>Add a saved delivery address before continuing.</p></div>}
      <Link className="text-link" href="/account/addresses?returnTo=/checkout">{addresses.length?"Add another address":"Add a delivery address"}</Link>
    </section>
    {quoteError&&<section className="checkout-notice" role="alert"><p>{quoteError}</p><p>Select another saved address or add one in a supported shipping region.</p></section>}
    {quote&&<><section className="checkout-step"><p className="eyebrow">Step 2</p><h2>Delivery information</h2><p><strong>Standard delivery</strong>{quote.deliveryEstimate?` · ${quote.deliveryEstimate}`:""}</p><p>Delivering to {quote.address.city}, {quote.address.state}.</p></section>
      <section className="checkout-summary"><h2>Your pieces</h2>{quote.lines.map(line=><p key={line.id}>{line.productName}{line.variantName&&` · ${line.variantName}`} <span>{line.quantity} × ₹{line.price.toString()}</span></p>)}<p>Subtotal <span>₹{quote.subtotal.toString()}</span></p><p>Shipping <span>{quote.shipping.isZero()?"Complimentary":`₹${quote.shipping.toString()}`}</span></p><p>Discount <span>₹{quote.discount.toString()}</span></p><p>Tax <span>₹{quote.tax.toString()}</span></p><h2>Total <span>₹{quote.total.toString()}</span></h2></section>
      <CheckoutOrderForm addressId={quote.address.id} checkoutToken={randomUUID()} codEnabled={quote.allowedPaymentMethods.includes("COD")}/>
    </>}
  </section></main>;
}
