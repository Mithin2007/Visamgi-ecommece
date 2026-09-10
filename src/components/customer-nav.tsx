"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";

export function CustomerNav({authenticated}:{authenticated:boolean}){
  const [open,setOpen]=useState(false);
  const pathname=usePathname();
  const menuButton=useRef<HTMLButtonElement>(null);
  const firstLink=useRef<HTMLAnchorElement>(null);
  useEffect(()=>{const close=(event:KeyboardEvent)=>event.key==="Escape"&&setOpen(false);document.addEventListener("keydown",close);document.body.style.overflow=open?"hidden":"";return()=>{document.removeEventListener("keydown",close);document.body.style.overflow=""};},[open]);
  useEffect(()=>{if(open) firstLink.current?.focus();},[open]);
  const close=()=>setOpen(false);
  const link=(href:string,label:string,ref?:RefObject<HTMLAnchorElement | null>)=><Link ref={ref} href={href} onClick={close} aria-current={pathname===href?"page":undefined}>{label}</Link>;
  return <><button ref={menuButton} className="menu-toggle" aria-expanded={open} aria-controls="customer-menu" aria-label={open?"Close navigation":"Open navigation"} onClick={()=>setOpen(!open)}>{open?"Close":"Menu"}</button><nav id="customer-menu" className={open?"customer-nav open":"customer-nav"} aria-label="Primary navigation">{link("/shop","Collection",firstLink)}{link("/about","About")}{link("/journal","Journal")}{link("/contact","Contact")}{link("/cart","Bag")}{authenticated?link("/account","Account"):link("/login","Sign in")}</nav>{open&&<button className="menu-backdrop" aria-label="Close navigation" onClick={close}/>}</>;
}
