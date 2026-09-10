import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
export default function ContactPage(){return <main><SiteHeader/><section className="quiet-page shell"><p className="eyebrow">Contact</p><h1>Let’s talk about your space.</h1><p>For now, explore the collection and save the pieces that speak to your home.</p><Link className="button" href="/shop">Explore the collection</Link></section><SiteFooter/></main>;}
