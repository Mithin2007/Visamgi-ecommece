import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import type { NormalizedChatbotMessage } from "./normalize";
import type { ExtractedEntities, ProductDimensions, ProductSearchResult } from "./types";

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "i",
  "in",
  "me",
  "my",
  "of",
  "on",
  "please",
  "product",
  "products",
  "search",
  "show",
  "something",
  "the",
  "to",
  "with",
]);

const toSafeNumber = (value: unknown) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
};

function effectivePrice(product: { price: Prisma.Decimal; salePrice: Prisma.Decimal | null }) {
  const sale = product.salePrice ? toSafeNumber(product.salePrice.toString()) : undefined;
  return sale !== undefined && sale > 0 ? product.salePrice!.toString() : product.price.toString();
}

function dimensions(value: Prisma.JsonValue | null): ProductDimensions | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const result: ProductDimensions = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string" || typeof item === "number") result[key] = item;
  }
  return Object.keys(result).length ? result : null;
}

function textTerms(input: NormalizedChatbotMessage, entities: ExtractedEntities) {
  const candidates = entities.productName
    ? entities.productName.split(/\s+/)
    : entities.keywords.length
      ? entities.keywords
      : input.tokens;

  return [...new Set(candidates
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length > 1 && !SEARCH_STOP_WORDS.has(term) && !/^\d+(?:\.\d+)?$/.test(term)))];
}

function effectivePriceCondition(range: ExtractedEntities["priceRange"]): Prisma.ProductWhereInput | undefined {
  if (!range) return undefined;
  const min = toSafeNumber(range.min);
  const max = toSafeNumber(range.max);
  if (min === undefined && max === undefined) return undefined;
  if (min !== undefined && max !== undefined && min > max) return undefined;

  const salePrice: Prisma.DecimalFilter = {};
  const regularPrice: Prisma.DecimalFilter = {};
  salePrice.gt = 0;
  if (min !== undefined) salePrice.gte = Math.max(min, 0.01);
  if (max !== undefined) salePrice.lte = max;

  const regular: Prisma.ProductWhereInput = {
    OR: [{ salePrice: null }, { salePrice: { lte: 0 } }],
    price: regularPrice,
  };
  if (min !== undefined) regularPrice.gte = min;
  if (max !== undefined) regularPrice.lte = max;

  return {
    OR: [
      { salePrice: { not: null, ...salePrice } },
      regular,
    ],
  };
}

/** Build parameterized public-catalogue conditions without querying the database. */
export function buildCatalogueWhere(
  input: NormalizedChatbotMessage,
  entities: ExtractedEntities,
): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [
    { published: true },
    { archivedAt: null },
  ];

  const terms = textTerms(input, entities);
  if (terms.length) {
    and.push({
      OR: terms.flatMap((term) => [
        { name: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { shortDescription: { contains: term, mode: "insensitive" } },
        { sku: { contains: term, mode: "insensitive" } },
        { material: { contains: term, mode: "insensitive" } },
        { color: { contains: term, mode: "insensitive" } },
        { tags: { has: term } },
        { category: { name: { contains: term, mode: "insensitive" } } },
      ]),
    });
  }

  if (entities.category) and.push({ category: { name: { contains: entities.category, mode: "insensitive" } } });
  if (entities.material) and.push({ material: { contains: entities.material, mode: "insensitive" } });
  if (entities.color) and.push({ color: { contains: entities.color, mode: "insensitive" } });

  const priceRange = entities.priceRange ?? (entities.budget !== undefined ? { max: entities.budget } : undefined);
  const priceCondition = effectivePriceCondition(priceRange);
  if (priceCondition) and.push(priceCondition);

  if (entities.availability === "available") {
    and.push({ stockStatus: { not: "OUT_OF_STOCK" } }, { stockQuantity: { gt: 0 } });
  } else if (entities.availability === "out_of_stock") {
    and.push({ OR: [{ stockStatus: "OUT_OF_STOCK" }, { stockQuantity: { lte: 0 } }] });
  }

  return { AND: and };
}

function toProductResult(product: {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: Prisma.Decimal;
  salePrice: Prisma.Decimal | null;
  material: string | null;
  color: string | null;
  dimensions: Prisma.JsonValue | null;
  stockQuantity: number;
  stockStatus: string;
  category: { name: string };
}) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    salePrice: product.salePrice ? product.salePrice.toString() : null,
    material: product.material,
    color: product.color,
    dimensions: dimensions(product.dimensions),
    category: product.category.name,
    stockQuantity: product.stockQuantity,
    availability: product.stockStatus === "OUT_OF_STOCK" || product.stockQuantity <= 0 ? "out_of_stock" : "available",
  } as const;
}

/** Read the current public catalogue and return only chatbot-safe product fields. */
export async function searchCatalogue(
  input: NormalizedChatbotMessage,
  entities: ExtractedEntities,
): Promise<ProductSearchResult> {
  if (!input?.normalized?.trim() && !entities) return { query: { keywords: [] }, products: [] };

  const products = await db.product.findMany({
    where: buildCatalogueWhere(input, entities),
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      price: true,
      salePrice: true,
      material: true,
      color: true,
      dimensions: true,
      stockQuantity: true,
      stockStatus: true,
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    query: entities,
    products: products.map((product) => ({
      ...toProductResult(product),
      price: product.price.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : null,
      effectivePrice: effectivePrice(product),
    })).map(({ effectivePrice: _effectivePrice, ...product }) => product),
  };
}
