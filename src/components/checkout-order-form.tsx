"use client";

import { useActionState } from "react";
import { placeOrder, type CheckoutActionState } from "../../app/checkout/actions";

const initialState:CheckoutActionState={error:""};

export function CheckoutOrderForm({addressId,checkoutToken,codEnabled}:{addressId:string;checkoutToken:string;codEnabled:boolean}){
  const [state,action,pending]=useActionState(placeOrder,initialState);
  if(!codEnabled)return <section className="checkout-notice" aria-live="polite"><h2>Payment options are being prepared.</h2><p>Online payment will be available soon. Cash on delivery is not available for this delivery address.</p></section>;
  return <form action={action} className="checkout-order-form">
    <input type="hidden" name="addressId" value={addressId}/><input type="hidden" name="checkoutToken" value={checkoutToken}/><input type="hidden" name="paymentMethod" value="COD"/>
    <section className="checkout-step"><p className="eyebrow">Step 3</p><h2>Payment method</h2><p className="checkout-method"><strong>Cash on delivery</strong><span>Pay when your order arrives.</span></p></section>
    <section className="checkout-step"><p className="eyebrow">Step 4</p><h2>Review and place order</h2><p>Your order will be created with payment pending. Online payments are not yet available.</p></section>
    {state.error&&<p className="form-error" role="alert">{state.error}</p>}
    <button className="button" disabled={pending}>{pending?"Creating order…":"Place cash-on-delivery order"}</button>
  </form>;
}
