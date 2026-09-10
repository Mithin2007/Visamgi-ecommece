import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: { toString(): string };
    salePrice: { toString(): string } | null;
    stockStatus: string;
    images: { url: string; alt: string }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const onSale = Boolean(product.salePrice);
  const displayPrice = product.salePrice ?? product.price;
  const unavailable = product.stockStatus === "OUT_OF_STOCK";

  return (
    <Link href={`/shop/product/${product.slug}`} className="product-card">
      <div className="product-card__image">
        {product.images[0] ? (
          <Image src={product.images[0].url} alt={product.images[0].alt || product.name} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" />
        ) : (
          <span className="product-image-fallback" role="img" aria-label="Product image unavailable">
            VISAMGI<small>Image forthcoming</small>
          </span>
        )}
        {unavailable && <span className="product-card__badge">Sold out</span>}
      </div>
      <div className="product-card__meta">
        <h2>{product.name}</h2>
        <p className="product-card__price">
          {onSale && <s>₹{product.price.toString()}</s>}
          <strong>₹{displayPrice.toString()}</strong>
        </p>
        <p className={unavailable ? "product-card__availability is-unavailable" : "product-card__availability"}>
          {unavailable ? "Currently unavailable" : "Available to order"}
        </p>
      </div>
    </Link>
  );
}
