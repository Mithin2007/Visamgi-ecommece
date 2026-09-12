import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/auth";
import { removeImage, reorderImages, removeVariant, saveVariant, updateProduct } from "../actions";
import { ProductImageUpload } from "@/components/product-image-upload";

export default async function EditProduct({params}:{params:Promise<{id:string}>}){
  await requireAdmin();
  const {id}=await params;
  const [product,categories]=await Promise.all([
    db.product.findUnique({where:{id},include:{images:{orderBy:{sortOrder:"asc"}},variants:true}}),
    db.category.findMany({orderBy:{name:"asc"}}),
  ]);
  if(!product)notFound();
  const imageIds=product.images.map(image=>image.id);
  return <><Link href="/admin/products">← Products</Link><p className="eyebrow">Edit product</p><h1>{product.name}</h1>
    <form className="admin-form" action={updateProduct.bind(null,id)}>
      <label>Product name<input name="name" defaultValue={product.name} required/></label>
      <label>Category<select name="categoryId" defaultValue={product.categoryId}>{categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label>Price<input name="price" type="number" step=".01" defaultValue={product.price.toString()} required/></label>
      <label>Offer price (optional)<input name="salePrice" type="number" step=".01" defaultValue={product.salePrice?.toString()}/></label>
      <label>Current stock<input value={product.stockQuantity} readOnly/><small>Change stock through Inventory to preserve history.</small></label>
      <label>Low-stock alert at<input name="lowStockThreshold" type="number" min="0" defaultValue={product.lowStockThreshold}/></label>
      <label>Material<input name="material" defaultValue={product.material??""}/></label><label>Colour<input name="color" defaultValue={product.color??""}/></label>
      <label className="wide">Description<textarea name="description" defaultValue={product.description} required/></label>
      <label className="check"><input name="published" type="checkbox" defaultChecked={product.published}/> Show in collection</label>
      <label className="check"><input name="featured" type="checkbox" defaultChecked={product.featured}/> Feature on home page</label>
      <button className="button">Save changes</button>
    </form>
    <h2>Images</h2><ProductImageUpload productId={id}/>
    <div className="admin-table">{product.images.map((image,index)=>{const moved=[...imageIds];if(index>0)[moved[index-1],moved[index]]=[moved[index],moved[index-1]];return <div className="tr" key={image.id}><span>{index===0?"Main image · ":""}{image.url}</span><form action={reorderImages.bind(null,id)}><input type="hidden" name="ids" value={moved.join(",")}/><button disabled={index===0}>Move up</button></form><form action={reorderImages.bind(null,id)}><input type="hidden" name="ids" value={[image.id,...imageIds.filter(item=>item!==image.id)].join(",")}/><button>Make main</button></form><form action={removeImage.bind(null,id,image.id)}><button>Remove</button></form></div>})}</div>
    <h2>Variants</h2><form className="admin-form" action={saveVariant.bind(null,id)}><label>Name<input name="name" required/></label><label>SKU<input name="sku" required/></label><label>Price override<input name="price" type="number" step=".01"/></label><label>Stock<input name="stockQuantity" type="number" min="0" defaultValue="0" required/></label><label className="wide">Attributes JSON<textarea name="attributes" defaultValue="{}"/></label><button className="button">Add variant</button></form>
    <div className="admin-table">{product.variants.map(variant=><form className="tr" key={variant.id} action={saveVariant.bind(null,id)}><input type="hidden" name="variantId" value={variant.id}/><label>Name<input name="name" defaultValue={variant.name}/><small>SKU<input name="sku" defaultValue={variant.sku}/></small></label><label>Stock<input name="stockQuantity" type="number" min="0" defaultValue={variant.stockQuantity}/></label><label>Price override<input name="price" type="number" step=".01" defaultValue={variant.price?.toString()}/><small>Attributes JSON<textarea name="attributes" defaultValue={JSON.stringify(variant.attributes)}/></small></label><button>Save variant</button><button formAction={removeVariant.bind(null,id,variant.id)}>Remove</button></form>)}</div>
  </>;
}
