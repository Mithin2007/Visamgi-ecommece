"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CustomerNav({authenticated}:{authenticated:boolean}){
  const [open,setOpen]=useState(false);
  useEffect(()=>{const close=(event:KeyboardEvent)=>event.key==="Escape"&&setOpen(false);document.addEventListener("keydown",close);document.body.style.overflow=open?"hidden":"";return()=>{document.removeEventListener("keydown",close);document.body.style.overflow=""};},[open]);
  const close=()=>setOpen(false);
  return <><button className="menu-toggle" aria-expanded={open} aria-controls="customer-menu" onClick={()=>setOpen(!open)}>{open?"Close":"Menu"}</button><nav id="customer-menu" className={open?"customer-nav open":"customer-nav"} aria-label="Primary navigation"><Link href="/shop" onClick={close}>Collection</Link><Link href="/about" onClick={close}>About</Link><Link href="/journal" onClick={close}>Journal</Link><Link href="/contact" onClick={close}>Contact</Link><Link href="/cart" onClick={close}>Bag</Link>{authenticated?<Link href="/account" onClick={close}>Account</Link>:<Link href="/login" onClick={close}>Sign in</Link>}</nav>{open&&<button className="menu-backdrop" aria-label="Close navigation" onClick={close}/>}</>;
}
