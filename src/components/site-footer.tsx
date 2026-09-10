import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer shell">
      <div>
        <Link className="site-footer__brand" href="/">VISAMGI</Link>
        <p>Heritage, considered.</p>
      </div>
      <nav aria-label="Footer navigation" className="site-footer__links">
        <Link href="/shop">Collection</Link>
        <Link href="/about">About</Link>
        <Link href="/journal">Journal</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <p className="site-footer__copyright">© {new Date().getFullYear()} VISAMGI</p>
    </footer>
  );
}
