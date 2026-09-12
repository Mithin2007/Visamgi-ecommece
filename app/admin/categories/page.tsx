import { db } from "@/server/db";
import { createCategory, deleteCategory } from "./actions";
import { requireAdmin } from "@/server/auth";

const displayName=(name:string)=>name.replace(/^Development Seed Collection$/i,"Main collection");

export default async function Categories(){
  await requireAdmin();
  const categories=await db.category.findMany({include:{_count:{select:{products:true}}},orderBy:{createdAt:"desc"}});
  return <><p className="eyebrow">Organise your shop</p><h1>Collections</h1><p className="admin-help">Create collections to help customers browse related products.</p>
    <form className="admin-form" action={createCategory}>
      <label>Collection name<input name="name" placeholder="Brass and ritual" required/></label>
      <label>Description (optional)<textarea name="description" placeholder="A short note for customers"/></label>
      <label>Display order<input name="sortOrder" type="number" defaultValue="0" min="0"/><small>Lower numbers appear first.</small></label>
      <label className="check"><input name="published" type="checkbox" defaultChecked/> Show this collection to customers</label>
      <button className="button">Create collection</button>
    </form>
    <div className="admin-table"><div className="tr head"><span>Collection</span><span>Products</span><span>Visibility</span><span>Actions</span></div>{categories.map(category=><div className="tr" key={category.id}><span><b>{displayName(category.name)}</b></span><span>{category._count.products} product{category._count.products===1?"":"s"}</span><span>{category.published?"Visible to customers":"Hidden from customers"}</span><div className="admin-actions"><form action={deleteCategory}><input type="hidden" name="id" value={category.id}/><button disabled={category._count.products>0}>{category._count.products>0?"Move products first":"Delete collection"}</button></form></div></div>)}</div>
  </>;
}
