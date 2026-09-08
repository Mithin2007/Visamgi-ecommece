import Link from "next/link";
import { currentCustomer } from "@/server/auth";

export async function SiteHeader() { const user=await currentCustomer();return <header className="site-header shell"><Link className="brand" href="/" aria-label="VISAMGI home">VISAMGI</Link><nav aria-label="Primary navigation"><Link href="/shop">Collection</Link><Link href="/about">About</Link><Link href="/journal">Journal</Link><Link href="/contact">Contact</Link></nav><div className="header-actions"><Link href="/cart">Bag</Link>{user?<Link href="/account">Account</Link>:<Link href="/login">Sign in</Link>}</div></header>; }
