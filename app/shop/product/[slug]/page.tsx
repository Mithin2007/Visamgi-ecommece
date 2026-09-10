import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { customerDescription, customerName } from "@/components/customer-presentation";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductVisual } from "@/components/product-visual";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function Product({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const product=await db.product.findFirst({where:{slug,published:true,archivedAt:null},include:{images:{orderBy:{sortOrder:"asc"}},variants:true}});
  if(!product)notFound();
  const related=await db.product.findMany({where:{categoryId:product.categoryId,published:true,archivedAt:null,id:{not:product.id}},include:{images:{orderBy:{sortOrder:"asc"}}},orderBy:{createdAt:"desc"},take:3});
  const title=customerName(product.name,"Heritage object"),description=customerDescription(product.description),basePrice=(product.salePrice??product.price).toString();
  return <main><SiteHeader/><article className="product-page shell"><section className="product-gallery" aria-label={`${title} gallery`}><ProductVisual images={product.images} alt={title} sizes="(max-width: 760px) 100vw, 58vw" className="product-gallery__primary"/>{product.images.slice(1).map(image=><ProductVisual images={[image]} alt={image.alt||title} sizes="(max-width: 760px) 100vw, 29vw" className="product-gallery__secondary" key={image.id}/>)}</section><section className="product-info"><p className="eyebrow">{product.material??"VISAMGI collection"}</p><h1>{title}</h1>{description&&<p className="product-info__description">{description}</p>}<ProductPurchase productId={product.id} basePrice={basePrice} stockQuantity={product.stockQuantity} variants={product.variants.map(variant=>({id:variant.id,name:variant.name,price:variant.price?.toString()??null,stockQuantity:variant.stockQuantity}))}/><dl className="product-details"><div><dt>Material</dt><dd>{product.material??"Details on request"}</dd></div>{product.color&&<div><dt>Finish</dt><dd>{product.color}</dd></div>}<div><dt>Availability</dt><dd>{product.stockStatus==="OUT_OF_STOCK"?"Currently unavailable":"Available to order"}</dd></div></dl></section></article>{related.length>0&&<section className="related-products shell"><div className="section-heading"><div><p className="eyebrow">Continue exploring</p><h2>More to consider</h2></div></div><div className="product-grid">{related.map(item=><ProductCard product={item} key={item.id}/>)}</div></section>}<SiteFooter/></main>;
}
