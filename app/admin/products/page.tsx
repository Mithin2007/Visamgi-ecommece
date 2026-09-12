import Link from "next/link";
import { db } from "@/server/db";
import { archiveProduct, createProduct } from "./actions";
import { requireAdmin } from "@/server/auth";

const stockLabel=(status:"IN_STOCK"|"LOW_STOCK"|"OUT_OF_STOCK")=>status==="IN_STOCK"?"Ready to sell":status==="LOW_STOCK"?"Running low":"Out of stock";

export default async function Products({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}){
  await requireAdmin();
  const search=await searchParams,q=search.q?.trim(),page=Math.max(1,Number(search.page)||1),take=20;
  const where={archivedAt:null,...(q?{OR:[{name:{contains:q,mode:"insensitive" as const}},{sku:{contains:q,mode:"insensitive" as const}}]}:{})};
  const [items,total,categories]=await Promise.all([
    db.product.findMany({where,include:{category:true},orderBy:{updatedAt:"desc"},skip:(page-1)*take,take}),
    db.product.count({where}),
    db.category.findMany({where:{published:true},orderBy:{name:"asc"}}),
  ]);
  return <><p className="eyebrow">Catalogue</p><h1>Products</h1>
    <form className="admin-form" action={createProduct}>
      <label>Product name<input name="name" required/></label>
      <label>Category<select name="categoryId" required><option value="">Select a category</option>{categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label>Price (INR)<input name="price" type="number" step="0.01" min="0.01" required/></label>
      <label>Offer price (optional)<input name="salePrice" type="number" step="0.01" min="0.01"/></label>
      <label>Initial stock<input name="stockQuantity" type="number" min="0" defaultValue="0" required/></label>
      <label>Low-stock alert at<input name="lowStockThreshold" type="number" min="0" defaultValue="2" required/></label>
      <label>Material<input name="material"/></label><label>Colour<input name="color"/></label>
      <label className="wide">Description<textarea name="description" minLength={10} required/></label>
      <label className="check"><input name="published" type="checkbox"/> Show in collection</label>
      <label className="check"><input name="featured" type="checkbox"/> Feature on home page</label>
      <button className="button" disabled={!categories.length}>Create product</button>
      {!categories.length&&<small>Create and publish a category first.</small>}
    </form>
    <form className="search"><input name="q" defaultValue={q} placeholder="Search products"/><button>Search</button></form>
    <div className="admin-table"><div className="tr head"><span>Product</span><span>Category</span><span>Availability</span><span>Actions</span></div>{items.map(product=><div className="tr" key={product.id}><span><b>{product.name}</b><small>₹{product.price.toString()}</small></span><span>{product.category.name.replace(/^Development Seed Collection$/i,"Main collection")}</span><span><b>{stockLabel(product.stockStatus)}</b><small>{product.stockQuantity} available</small></span><div className="admin-actions"><Link href={`/admin/products/${product.id}`}>Edit details</Link><form action={archiveProduct}><input name="id" type="hidden" value={product.id}/><button>Remove from shop</button></form></div></div>)}</div>
    <p className="pagination">{total} product{total===1?"":"s"} · Page {page}{page>1&&<Link href={`/admin/products?page=${page-1}${q?`&q=${encodeURIComponent(q)}`:""}`}> Previous</Link>}{items.length===take&&<Link href={`/admin/products?page=${page+1}${q?`&q=${encodeURIComponent(q)}`:""}`}> Next</Link>}</p>
  </>;
}
