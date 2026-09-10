import Link from "next/link";
import { logout } from "@/actions";
import { requireCustomer } from "@/server/auth";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export default async function Account(){const user=await requireCustomer();return <main><SiteHeader/><section className="account-page shell"><p className="eyebrow">Your VISAMGI</p><h1>Welcome, {user.name??"collector"}.</h1><p className="account-page__lede">Keep your delivery details and order history in one considered place.</p><div className="account-links"><Link href="/account/orders"><span className="eyebrow">Orders</span><strong>View your order history</strong><small>Track your pieces and their current status.</small><i aria-hidden="true">→</i></Link><Link href="/account/addresses"><span className="eyebrow">Addresses</span><strong>Manage delivery details</strong><small>Save the addresses you use most often.</small><i aria-hidden="true">→</i></Link></div><div className="account-actions"><Link className="text-link" href="/shop">Continue exploring</Link><form action={logout}><button>Sign out</button></form></div></section><SiteFooter/></main>;}
