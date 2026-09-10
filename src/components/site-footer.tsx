import Link from "next/link";

export function SiteFooter(){
  return <footer className="site-footer"><div className="shell site-footer__grid"><section><Link className="brand" href="/">VISAMGI</Link><p>Heritage, considered.</p></section><nav aria-label="Explore"><p className="footer-label">Explore</p><Link href="/shop">Collection</Link><Link href="/about">About</Link><Link href="/journal">Journal</Link><Link href="/contact">Contact</Link></nav><nav aria-label="Account"><p className="footer-label">Account</p><Link href="/account">Account</Link><Link href="/account/orders">Orders</Link><Link href="/account/addresses">Addresses</Link><Link href="/cart">Bag</Link></nav></div><div className="shell site-footer__base"><span>© {new Date().getFullYear()} VISAMGI</span><span>Objects chosen with care.</span></div></footer>;
}
