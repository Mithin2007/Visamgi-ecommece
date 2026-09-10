import Link from "next/link";
import { db } from "@/server/db";
import { customerName } from "@/components/customer-presentation";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function Shop(){
  const [products,categories]=await Promise.all([db.product.findMany({where:{published:true,archivedAt:null},include:{images:{orderBy:{sortOrder:"asc"}}},orderBy:{createdAt:"desc"}}),db.category.findMany({where:{published:true},orderBy:{sortOrder:"asc"}})]);
  return <main><SiteHeader/><section className="catalogue-hero shell"><p className="eyebrow">The collection</p><h1>Objects chosen for their soul.</h1><p>Quiet pieces for rooms with a point of view.</p>{categories.length>0&&<nav className="shop-links" aria-label="Browse collections">{categories.map(category=><Link key={category.id} href={`/shop/${category.slug}`}>{customerName(category.name,"The collection")}</Link>)}</nav>}</section><section className="catalogue-grid shell" aria-label="Products">{products.length?<div className="product-grid">{products.map(product=><ProductCard product={product} key={product.id}/>)}</div>:<div className="empty-state empty-state--compact"><p className="eyebrow">The collection</p><h2>New pieces are being considered.</h2><p>Please return soon to explore the collection.</p></div>}</section><SiteFooter/></main>;
}
