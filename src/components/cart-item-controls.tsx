"use client";

import { useActionState } from "react";
import { removeCartWithFeedback, updateCartWithFeedback } from "@/actions";

const initialState={error:"",success:""};

export function CartItemControls({itemId,quantity}:{itemId:string;quantity:number}){
  const [updateState,updateAction,updating]=useActionState(updateCartWithFeedback,initialState);
  const [removeState,removeAction,removing]=useActionState(removeCartWithFeedback,initialState);
  return <div className="cart-controls"><form action={updateAction}><input type="hidden" name="itemId" value={itemId}/><input name="quantity" type="number" min="1" defaultValue={quantity} aria-label="Quantity"/><button disabled={updating}>{updating?"Updating…":"Update"}</button></form><form action={removeAction}><input type="hidden" name="itemId" value={itemId}/><button disabled={removing}>{removing?"Removing…":"Remove"}</button></form>{(updateState.error||removeState.error)&&<p className="form-error" role="alert">{updateState.error||removeState.error}</p>}{(updateState.success||removeState.success)&&<p className="form-success" aria-live="polite">{updateState.success||removeState.success}</p>}</div>;
}
