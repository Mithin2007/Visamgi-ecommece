import { notFound } from "next/navigation";
import { db, withCatalogueFallback } from "@/server/db";
import { customerDescription, customerName } from "@/components/customer-presentation";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function Category({params}:{params:Promise<{category:string}>}){
  const {category}=await params;
  const row=await withCatalogueFallback(`category:${category}`,()=>db.category.findFirst({where:{slug:category,published:true},include:{products:{where:{published:true,archivedAt:null},include:{images:{orderBy:{sortOrder:"asc"}}},orderBy:{createdAt:"desc"}}}}),null);
  if(!row)notFound();
  const description=customerDescription(row.description);
  return <main><SiteHeader/><section className="catalogue-hero shell"><p className="eyebrow">Collection</p><h1>{customerName(row.name,"The collection")}</h1>{description&&<p>{description}</p>}</section><section className="catalogue-grid shell">{row.products.length?<div className="product-grid">{row.products.map(product=><ProductCard product={product} key={product.id}/>)}</div>:<div className="empty-state empty-state--compact"><h2>Pieces are being considered.</h2><p>Please explore the wider collection in the meantime.</p></div>}</section><SiteFooter/></main>;
}
