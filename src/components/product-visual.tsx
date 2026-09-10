import Image from "next/image";

type ProductImage={id:string;url:string;alt:string};

export function ProductVisual({images,alt,sizes,className}:{images:ProductImage[];alt:string;sizes:string;className?:string}){
  const image=images[0];
  return <div className={className??"product-visual"}>{image?<Image src={image.url} alt={image.alt||alt} fill sizes={sizes}/>:<div className="product-visual__fallback" role="img" aria-label={`${alt} product placeholder`}><span>VISAMGI</span><small>Heritage object</small></div>}</div>;
}
