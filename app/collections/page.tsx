import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function CollectionsPage() {
  return <main><SiteHeader /><section className="quiet-page"><p className="eyebrow">VISAMGI collection</p><h1>Objects for considered spaces.</h1><p>Explore the current collection of pieces selected for material presence and everyday ritual.</p><Link className="button" href="/shop">Explore the collection</Link></section><SiteFooter /></main>;
}
