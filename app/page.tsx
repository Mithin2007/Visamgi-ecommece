import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const collections = [
  { name: "Sacred rituals", image: "/images/collections/brass-rituals.png" },
  { name: "Carved heritage", image: "/images/collections/stone-sculpture.png" },
  { name: "Living spaces", image: "/images/collections/furniture.png" },
];

export default function HomePage() {
  return <main>
    <SiteHeader />
    <section className="hero" aria-labelledby="hero-title">
      <Image src="/images/hero/visamgi-home.png" alt="Brass lamps and Ganesha sculpture arranged in a warm home setting" fill priority sizes="100vw" />
      <div className="hero__veil" />
      <div className="hero__content shell"><p className="eyebrow">Objects with a memory</p><h1 id="hero-title">Heritage,<br />beautifully lived.</h1><p className="hero__lede">A considered collection of Indian craft, designed to bring warmth, ritual and character to the everyday.</p><Link className="button button--light" href="/shop">Explore the collection</Link></div>
    </section>
    <section className="statement shell"><p className="eyebrow">The VISAMGI point of view</p><h2>Old-world craft for rooms with a story to tell.</h2><p>We curate sculptural pieces, enduring materials and expressive details that make a house feel singular.</p></section>
    <section className="collections shell" aria-labelledby="collections-title"><div className="section-heading"><p className="eyebrow">Discover slowly</p><h2 id="collections-title">The collection</h2><Link href="/shop">View all <span aria-hidden="true">↗</span></Link></div><div className="collection-grid">{collections.map((collection) => <Link className="collection-card" href="/shop" key={collection.name}><div className="collection-card__image"><Image src={collection.image} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" /></div><h3>{collection.name}</h3><span>Explore <span aria-hidden="true">→</span></span></Link>)}</div></section>
    <section className="editorial"><div className="editorial__image"><Image src="/images/editorial/craft-detail.png" alt="Heritage wooden arch and handcrafted décor" fill sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="editorial__content"><p className="eyebrow">Made for meaning</p><h2>Every object carries the hand of its maker.</h2><p>From the patina of brass to the grain of reclaimed wood, material is where the story begins.</p><Link className="text-link" href="/about">Our story <span aria-hidden="true">→</span></Link></div></section>
    <section className="assistant-invite shell"><p className="eyebrow">Need a little guidance?</p><h2>Tell us about your space.</h2><p>Our shopping assistant will soon help you find pieces that belong together.</p><button className="button" type="button" disabled aria-describedby="assistant-note">Assistant coming soon</button><small id="assistant-note">Catalogue-connected recommendations arrive in a later phase.</small></section>
    <footer className="footer shell"><span>VISAMGI</span><p>Heritage, considered.</p><p>© {new Date().getFullYear()} VISAMGI</p></footer>
  </main>;
}
