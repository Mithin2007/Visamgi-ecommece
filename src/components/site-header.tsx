import Link from "next/link";

export function SiteHeader() { return <header className="site-header shell"><Link className="brand" href="/" aria-label="VISAMGI home">VISAMGI</Link><nav aria-label="Primary navigation"><Link href="/collections">Collection</Link><Link href="/about">About</Link><Link href="/journal">Journal</Link><Link href="/contact">Contact</Link></nav><div className="header-actions"><button type="button" aria-label="Search" disabled>Search</button><button type="button" aria-label="Shopping bag" disabled>Bag (0)</button></div></header>; }
