import Link from "next/link";
import { customerName } from "@/components/customer-presentation";
import { ProductVisual } from "@/components/product-visual";

type CardProduct={id:string;name:string;slug:string;price:{toString():string};salePrice:{toString():string}|null;material:string|null;stockStatus:string;images:{id:string;url:string;alt:string}[]};

export function ProductCard({product}:{product:CardProduct}){
  const title=customerName(product.name,"Heritage object"),available=product.stockStatus!=="OUT_OF_STOCK";
  return <Link href={`/shop/product/${product.slug}`} className="product-card"><ProductVisual images={product.images} alt={title} sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 33vw" className="product-card__visual"/><div className="product-card__details"><p className="product-card__eyebrow">{product.material??"VISAMGI collection"}</p><h2>{title}</h2><div><strong>₹{(product.salePrice??product.price).toString()}</strong><span className={available?"status-dot":"status-dot status-dot--muted"}>{available?"Available":"Sold out"}</span></div></div></Link>;
}
