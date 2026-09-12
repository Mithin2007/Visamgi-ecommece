import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db, withCatalogueFallback } from "@/server/db";
import { customerName } from "@/components/customer-presentation";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CollectionFilters } from "@/components/collection-filters";

type ShopSearch={q?:string;category?:string;availability?:string;sort?:string};

export default async function Shop({searchParams}:{searchParams:Promise<ShopSearch>}){
  const search=await searchParams,q=search.q?.trim()||"",category=search.category||"",availability=search.availability||"",sort=search.sort||"newest";
    const where:Prisma.ProductWhereInput={published:true,archivedAt:null};
    if(category)where.categoryId=category;
    if(availability==="available")where.stockStatus={not:"OUT_OF_STOCK"};
    if(q)where.OR=[{name:{contains:q,mode:"insensitive"}},{material:{contains:q,mode:"insensitive"}},{description:{contains:q,mode:"insensitive"}}];
    const orderBy=sort==="price-low"?{price:"asc" as const}:sort==="price-high"?{price:"desc" as const}:{createdAt:"desc" as const};
    const [products,categories]=await withCatalogueFallback(`shop:${q}:${category}:${availability}:${sort}`,()=>Promise.all([db.product.findMany({where,include:{images:{orderBy:{sortOrder:"asc"}}},orderBy}),db.category.findMany({where:{published:true},orderBy:{sortOrder:"asc"}})]),[[],[]]);
    return <main><SiteHeader/><section className="catalogue-hero shell"><p className="eyebrow">The collection</p><h1>Objects chosen for their soul.</h1><p>Search, compare and collect pieces for a home with a point of view.</p>{categories.length>0&&<nav className="shop-links" aria-label="Browse collections">{categories.map(item=><Link key={item.id} href={`/shop/${item.slug}`}>{customerName(item.name,"The collection")}</Link>)}</nav>}</section><section className="catalogue-grid shell" aria-label="Products"><CollectionFilters initialQuery={q} initialCategory={category} initialAvailability={availability} initialSort={sort} categories={categories.map(item=>({value:item.id,label:customerName(item.name,"Collection")}))}/>{products.length?<><p className="shop-results">{products.length} {products.length===1?"piece":"pieces"} found</p><div className="product-grid">{products.map(product=><ProductCard product={product} key={product.id}/>)}</div></>:<div className="empty-state empty-state--compact"><p className="eyebrow">No matches yet</p><h2>Try a different search.</h2><p>Clear a filter or browse the full collection.</p><Link className="button" href="/shop">View all pieces</Link></div>}</section><SiteFooter/></main>;
}
