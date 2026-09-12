/**
 * Public contracts for the VISAMGI rule-based chatbot.
 *
 * These types intentionally describe only catalogue discovery, product
 * information, recommendations, approved store FAQs, and safe fallbacks.
 */

export enum ChatbotIntent {
  PRODUCT_SEARCH = "product_search",
  PRODUCT_FILTER = "product_filter",
  PRODUCT_INFORMATION = "product_information",
  PRODUCT_RECOMMENDATION = "product_recommendation",
  STORE_FAQ = "store_faq",
  GREETING = "greeting",
  UNSUPPORTED = "unsupported",
  AMBIGUOUS = "ambiguous",
}

export type ChatbotRequest = {
  message: string;
};

export type PriceRange = {
  min?: number;
  max?: number;
};

export type ExtractedEntities = {
  productName?: string;
  category?: string;
  material?: string;
  color?: string;
  keywords: string[];
  priceRange?: PriceRange;
  budget?: number;
  availability?: "available" | "out_of_stock" | "any";
  faqTopic?:
    | "how_to_buy"
    | "payment"
    | "shipping"
    | "delivery"
    | "returns"
    | "other_policy";
};

export type ProductDimensions = {
  height?: string | number;
  width?: string | number;
  depth?: string | number;
  length?: string | number;
  unit?: string;
  [key: string]: string | number | undefined;
};

export type ProductResult = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  salePrice: string | null;
  material: string | null;
  color: string | null;
  dimensions: ProductDimensions | null;
  category: string;
  stockQuantity: number;
  availability: "available" | "out_of_stock";
};

export type FAQResult = {
  topic:
    | "how_to_buy"
    | "payment"
    | "shipping"
    | "delivery"
    | "returns"
    | "other_policy";
  question: string;
  answer: string;
  source: "approved_store_policy" | "live_shipping_configuration";
};

export type RecommendationReason =
  | "matching_category"
  | "matching_material"
  | "matching_color"
  | "within_budget"
  | "related_attributes";

export type RecommendationResult = {
  product: ProductResult;
  reasons: RecommendationReason[];
};

export type ProductSearchResult = {
  query: ExtractedEntities;
  products: ProductResult[];
};

export type FallbackResponse = {
  kind: "fallback";
  message: string;
  suggestions: string[];
};

export type ClarificationResponse = {
  kind: "clarification";
  message: string;
  missing: Array<"product" | "category" | "budget" | "faq_topic" | "preference">;
  suggestions: string[];
};

export type ChatbotResponse =
  | {
      kind: "greeting";
      intent: ChatbotIntent.GREETING;
      message: string;
    }
  | {
      kind: "products";
      intent:
        | ChatbotIntent.PRODUCT_SEARCH
        | ChatbotIntent.PRODUCT_FILTER;
      message: string;
      result: ProductSearchResult;
    }
  | {
      kind: "product_information";
      intent: ChatbotIntent.PRODUCT_INFORMATION;
      message: string;
      product: ProductResult;
    }
  | {
      kind: "recommendations";
      intent: ChatbotIntent.PRODUCT_RECOMMENDATION;
      message: string;
      recommendations: RecommendationResult[];
    }
  | {
      kind: "faq";
      intent: ChatbotIntent.STORE_FAQ;
      message: string;
      faq: FAQResult;
    }
  | FallbackResponse
  | ClarificationResponse;
