import type { NormalizedChatbotMessage } from "./normalize";
import type {
  ExtractedEntities,
  ProductResult,
  ProductSearchResult,
  RecommendationReason,
  RecommendationResult,
} from "./types";

export const RECOMMENDATION_WEIGHTS = {
  exactKeyword: 100,
  category: 50,
  material: 40,
  color: 35,
  withinBudget: 30,
  availability: 25,
  textRelevance: 1,
} as const;

const MAX_RECOMMENDATIONS = 5;
const STOP_WORDS = new Set(["a", "an", "and", "for", "i", "me", "my", "of", "the", "to", "with"]);

type ScoredRecommendation = {
  product: ProductResult;
  reasons: RecommendationReason[];
  score: number;
  effectivePrice: number | undefined;
};

const normalise = (value: string | null | undefined) => value?.trim().toLowerCase() ?? "";

function containsTerm(value: string | null | undefined, term: string) {
  const text = normalise(value);
  return new RegExp(`(^|\\s)${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`).test(text);
}

function effectivePrice(product: ProductResult) {
  const salePrice = product.salePrice === null ? undefined : Number(product.salePrice);
  if (salePrice !== undefined && Number.isFinite(salePrice) && salePrice > 0) return salePrice;

  const price = Number(product.price);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

function priceMatches(product: ProductResult, entities: ExtractedEntities) {
  const value = effectivePrice(product);
  if (value === undefined) return false;

  const range = entities.priceRange ?? (entities.budget === undefined ? undefined : { max: entities.budget });
  if (!range) return true;
  if (range.min !== undefined && value < range.min) return false;
  if (range.max !== undefined && value > range.max) return false;
  return true;
}

function searchTerms(input: NormalizedChatbotMessage, entities: ExtractedEntities) {
  const terms = entities.productName
    ? entities.productName.split(/\s+/)
    : [...entities.keywords, ...(entities.category ? [entities.category] : [])];

  if (!terms.length) terms.push(...input.tokens);
  return [...new Set(terms.map(normalise).filter((term) => term.length > 1 && !STOP_WORDS.has(term)))];
}

function textRelevance(product: ProductResult, terms: readonly string[]) {
  const searchable = [product.name, product.description, product.category, product.material, product.color]
    .map(normalise)
    .join(" ");
  return terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0);
}

function scoreProduct(
  product: ProductResult,
  input: NormalizedChatbotMessage,
  entities: ExtractedEntities,
): ScoredRecommendation | null {
  const requestedOutOfStock = entities.availability === "out_of_stock";
  const available = product.availability === "available";
  if (!requestedOutOfStock && !available) return null;
  if (requestedOutOfStock && available) return null;
  if (!priceMatches(product, entities)) return null;

  const reasons: RecommendationReason[] = [];
  let score = 0;
  const terms = searchTerms(input, entities);
  const keywordMatch = entities.keywords.some((keyword) => containsTerm(product.name, keyword)
    || containsTerm(product.category, keyword)
    || containsTerm(product.description, keyword));

  if (keywordMatch) {
    score += RECOMMENDATION_WEIGHTS.exactKeyword;
    reasons.push("related_attributes");
  }
  if (entities.category && containsTerm(product.category, entities.category)) {
    score += RECOMMENDATION_WEIGHTS.category;
    reasons.push("matching_category");
  }
  if (entities.material && containsTerm(product.material, entities.material)) {
    score += RECOMMENDATION_WEIGHTS.material;
    reasons.push("matching_material");
  }
  if (entities.color && containsTerm(product.color, entities.color)) {
    score += RECOMMENDATION_WEIGHTS.color;
    reasons.push("matching_color");
  }
  if (entities.priceRange || entities.budget !== undefined) {
    score += RECOMMENDATION_WEIGHTS.withinBudget;
    reasons.push("within_budget");
  }
  if (available) {
    score += RECOMMENDATION_WEIGHTS.availability;
    if (entities.availability === "available") reasons.push("related_attributes");
  }
  score += textRelevance(product, terms) * RECOMMENDATION_WEIGHTS.textRelevance;

  return { product, reasons: [...new Set(reasons)], score, effectivePrice: effectivePrice(product) };
}

/** Rank products already returned by the read-only catalogue search layer. */
export function recommendProducts(
  input: NormalizedChatbotMessage,
  entities: ExtractedEntities,
  catalogue: ProductSearchResult,
): RecommendationResult[] {
  if (!catalogue?.products?.length) return [];

  const uniqueProducts = new Map<string, ProductResult>();
  for (const product of catalogue.products) {
    if (!uniqueProducts.has(product.id)) uniqueProducts.set(product.id, product);
  }

  return [...uniqueProducts.values()]
    .map((product) => scoreProduct(product, input, entities))
    .filter((recommendation): recommendation is ScoredRecommendation => recommendation !== null)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.effectivePrice !== right.effectivePrice) {
        return (left.effectivePrice ?? Number.POSITIVE_INFINITY) - (right.effectivePrice ?? Number.POSITIVE_INFINITY);
      }
      return left.product.slug.localeCompare(right.product.slug) || left.product.id.localeCompare(right.product.id);
    })
    .slice(0, MAX_RECOMMENDATIONS)
    .map(({ product, reasons }) => ({ product, reasons }));
}
