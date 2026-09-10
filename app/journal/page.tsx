import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export default function JournalPage(){return <main><SiteHeader/><section className="quiet-page shell"><p className="eyebrow">Journal</p><h1>Stories worth keeping.</h1><p>A space for the materials, rooms and rituals that shape the VISAMGI point of view.</p><Link className="button" href="/shop">Explore the collection</Link></section><SiteFooter/></main>;}
