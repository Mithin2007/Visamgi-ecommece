import { ChatbotIntent } from "./types";
import type {
  ChatbotResponse,
  ClarificationResponse,
  ExtractedEntities,
  FAQResult,
  FallbackResponse,
  ProductResult,
  ProductSearchResult,
  RecommendationResult,
} from "./types";

const formatPrice = (product: ProductResult) => {
  const salePrice = product.salePrice === null ? undefined : Number(product.salePrice);
  const effective = salePrice !== undefined && Number.isFinite(salePrice) && salePrice > 0
    ? product.salePrice
    : product.price;
  return effective ? `₹${effective}` : "Price unavailable";
};

const formatAvailability = (product: ProductResult) =>
  product.availability === "available" ? "Available to order" : "Currently out of stock";

const productLabel = (product: ProductResult) => {
  const details = [product.category, product.material, product.color].filter(Boolean);
  return details.length ? `${product.name} (${details.join(", ")})` : product.name;
};

const safeProduct = (product: ProductResult | null | undefined): product is ProductResult =>
  Boolean(product && typeof product.id === "string" && typeof product.name === "string");

export function buildGreetingResponse(): ChatbotResponse {
  return {
    kind: "greeting",
    intent: ChatbotIntent.GREETING,
    message: "Hello. I can help you find VISAMGI products, compare details, check availability, and answer approved store questions.",
  };
}

export function buildFaqResponse(faq: FAQResult): ChatbotResponse {
  return {
    kind: "faq",
    intent: ChatbotIntent.STORE_FAQ,
    message: faq.answer,
    faq,
  };
}

export function buildProductSearchResponse(
  result: ProductSearchResult | null | undefined,
  intent: ChatbotIntent.PRODUCT_SEARCH | ChatbotIntent.PRODUCT_FILTER = ChatbotIntent.PRODUCT_SEARCH,
): ChatbotResponse {
  const query = result?.query ?? { keywords: [] };
  const products = result?.products?.filter(safeProduct) ?? [];
  const message = products.length
    ? `${products.length} VISAMGI ${products.length === 1 ? "piece" : "pieces"} found.`
    : "I could not find a matching VISAMGI product. Try a different keyword, material, color, category, or budget.";

  return {
    kind: "products",
    intent,
    message,
    result: { query, products },
  };
}

export function buildNoResultsResponse(query: ExtractedEntities = { keywords: [] }): ChatbotResponse {
  return buildProductSearchResponse({ query, products: [] });
}

export function buildRecommendationResponse(recommendations: RecommendationResult[]): ChatbotResponse {
  const safeRecommendations = (recommendations ?? []).filter((item) => safeProduct(item?.product));
  const message = safeRecommendations.length
    ? "Here are some VISAMGI pieces that match your request."
    : "I could not find a suitable VISAMGI recommendation for those preferences.";

  return {
    kind: "recommendations",
    intent: ChatbotIntent.PRODUCT_RECOMMENDATION,
    message,
    recommendations: safeRecommendations,
  };
}

export function buildProductInformationResponse(product: ProductResult | null | undefined): ChatbotResponse {
  if (!safeProduct(product)) return buildNoResultsResponse();

  const details = [
    `${productLabel(product)} is ${formatPrice(product)}.`,
    formatAvailability(product) + ".",
    product.description ? product.description : undefined,
    product.dimensions ? `Dimensions: ${Object.entries(product.dimensions).map(([key, value]) => `${key} ${value}`).join(", ")}.` : undefined,
  ].filter(Boolean).join(" ");

  return {
    kind: "product_information",
    intent: ChatbotIntent.PRODUCT_INFORMATION,
    message: details,
    product,
  };
}

export function buildClarificationResponse(
  message = "Could you share a product, category, material, color, budget, or FAQ topic?",
  missing: ClarificationResponse["missing"] = ["preference"],
): ChatbotResponse {
  return {
    kind: "clarification",
    message,
    missing,
    suggestions: ["Show brass lamps", "Find products under ₹5000", "What can you help me with?"],
  };
}

export function buildUnsupportedResponse(): FallbackResponse {
  return {
    kind: "fallback",
    message: "I can only help with VISAMGI products, availability, recommendations, and store information.",
    suggestions: ["Search VISAMGI products", "Ask about shipping or payment", "Ask for a product recommendation"],
  };
}

export function buildPrivateDataResponse(): FallbackResponse {
  return {
    kind: "fallback",
    message: "I cannot access or provide private account, address, cart, payment transaction, or order information.",
    suggestions: ["Search the VISAMGI collection", "Ask about store policies", "Ask about a public product detail"],
  };
}
