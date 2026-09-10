"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function CustomerNav({ authenticated }: { authenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [open]);
  const links = [{ href: "/shop", label: "Collection" }, { href: "/about", label: "About" }, { href: "/journal", label: "Journal" }, { href: "/contact", label: "Contact" }, { href: "/cart", label: "Bag" }, { href: authenticated ? "/account" : "/login", label: authenticated ? "Account" : "Sign in" }];
  const active = (href: string) => href === "/account" ? pathname.startsWith("/account") : href === "/shop" ? pathname.startsWith("/shop") : pathname === href;
  const close = () => setOpen(false);
  return (
    <>
      <button className="menu-toggle" aria-expanded={open} aria-controls="customer-menu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      <nav ref={menuRef} id="customer-menu" className={open ? "customer-nav open" : "customer-nav"} aria-label="Primary navigation">
        {links.map((link) => <Link aria-current={active(link.href) ? "page" : undefined} href={link.href} onClick={close} key={link.href}>{link.label}</Link>)}
      </nav>
      {open && <button className="menu-backdrop" aria-label="Close navigation" onClick={close} />}
    </>
  );
}
