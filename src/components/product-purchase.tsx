"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { addToCart, buyNow } from "@/actions";

type Variant={id:string;name:string;price:string|null;stockQuantity:number};

function PurchaseButtons({available}:{available:boolean}){const {pending}=useFormStatus();if(!available)return <button className="button" disabled>Out of stock</button>;return <div className="product-purchase__actions"><button className="button button--secondary" disabled={pending}>{pending?"Adding…":"Add to bag"}</button><button className="button" formAction={buyNow} disabled={pending}>{pending?"Opening checkout…":"Buy now"}</button></div>;}

export function ProductPurchase({productId,basePrice,stockQuantity,variants}:{productId:string;basePrice:string;stockQuantity:number;variants:Variant[]}){
  const availableVariants=useMemo(()=>variants.filter(variant=>variant.stockQuantity>0),[variants]);
  const [variantId,setVariantId]=useState(availableVariants[0]?.id??"");
  const selected=variants.find(variant=>variant.id===variantId);
  const available=variants.length?Boolean(selected&&selected.stockQuantity>0):stockQuantity>0;
  const price=selected?.price??basePrice;
  return <form action={addToCart} className="product-purchase"><input type="hidden" name="productId" value={productId}/>
    <p className="price" aria-live="polite">₹{price}</p>
    {variants.length>0&&<label>Choose an option<select name="variantId" required value={variantId} onChange={event=>setVariantId(event.target.value)}>{variants.map(variant=><option key={variant.id} value={variant.id} disabled={variant.stockQuantity===0}>{variant.name}{variant.price?` · ₹${variant.price}`:""}{variant.stockQuantity===0?" · Sold out":""}</option>)}</select></label>}
    <p className="stock-message" aria-live="polite">{available?variants.length?`${selected?.stockQuantity} available in this option.`:"Available to order.":variants.length?"This option is sold out. Choose another option.":"This piece is currently unavailable."}</p>
    <label>Quantity<input name="quantity" type="number" min="1" defaultValue="1" disabled={!available}/></label><PurchaseButtons available={available}/>
  </form>;
}
