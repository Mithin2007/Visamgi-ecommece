import { ChatbotIntent } from "./types";
import type { NormalizedChatbotMessage } from "./normalize";

export type DetectedChatbotIntent = {
  intent: ChatbotIntent;
  score: number;
  matchedRules: string[];
};

const hasPhrase = (text: string, phrase: string) =>
  new RegExp(`(^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`).test(text);

const hasAnyPhrase = (text: string, phrases: readonly string[]) =>
  phrases.some((phrase) => hasPhrase(text, phrase));

const addRule = (rules: string[], rule: string) => {
  if (!rules.includes(rule)) rules.push(rule);
};

const productContextTerms = [
  "product",
  "brass",
  "wood",
  "stone",
  "metal",
  "lamp",
  "sculpture",
  "furniture",
  "mirror",
  "chair",
] as const;

/** Detect the first applicable intent using specific-before-broad rules. */
export function detectIntent(input: NormalizedChatbotMessage): DetectedChatbotIntent {
  const text = typeof input?.normalized === "string" ? input.normalized.trim() : "";
  const matchedRules: string[] = [];

  if (!text) {
    return { intent: ChatbotIntent.AMBIGUOUS, score: 0, matchedRules: ["empty_input"] };
  }

  if (hasAnyPhrase(text, ["hello", "hi", "hey", "vanakkam", "வணக்கம்"])) {
    addRule(matchedRules, "greeting");
    return { intent: ChatbotIntent.GREETING, score: 1, matchedRules };
  }

  if (hasAnyPhrase(text, [
    "shipping",
    "delivery",
    "payment",
    "returns",
    "refund",
    "exchange",
    "policy",
    "how to buy",
    "how can i buy",
    "how do i buy",
    "how to purchase",
    "how can i purchase",
    "buy from visamgi",
    "purchase from visamgi",
  ])) {
    if (hasPhrase(text, "shipping")) addRule(matchedRules, "shipping_faq");
    if (hasPhrase(text, "delivery")) addRule(matchedRules, "delivery_faq");
    if (hasPhrase(text, "payment")) addRule(matchedRules, "payment_faq");
    if (hasAnyPhrase(text, ["returns", "refund", "exchange"])) addRule(matchedRules, "returns_faq");
    if (hasAnyPhrase(text, [
      "policy",
      "how to buy",
      "how can i buy",
      "how do i buy",
      "how to purchase",
      "how can i purchase",
      "buy from visamgi",
      "purchase from visamgi",
    ])) addRule(matchedRules, "store_policy_faq");
    return { intent: ChatbotIntent.STORE_FAQ, score: 1, matchedRules };
  }

  if (hasAnyPhrase(text, ["recommendation", "recommend", "suggestion", "best", "parindurai"])) {
    addRule(matchedRules, "recommendation_keyword");
    if (hasAnyPhrase(text, ["budget", "price", "category", "material", "color", "product"])) {
      addRule(matchedRules, "recommendation_preference");
    }
    return { intent: ChatbotIntent.PRODUCT_RECOMMENDATION, score: 1, matchedRules };
  }

  const productContext = hasAnyPhrase(text, productContextTerms);
  const availabilityInquiry = hasAnyPhrase(text, ["availability", "stock", "available", "out of stock"]);
  const detailInquiry = hasAnyPhrase(text, [
    "details",
    "description",
    "dimensions",
    "information",
    "tell me about",
    "material",
    "color",
    "price",
  ]);

  if (availabilityInquiry && productContext) {
    addRule(matchedRules, "product_availability_with_context");
    return { intent: ChatbotIntent.PRODUCT_INFORMATION, score: 1, matchedRules };
  }

  if (detailInquiry && productContext) {
    addRule(matchedRules, "product_details_with_context");
    return { intent: ChatbotIntent.PRODUCT_INFORMATION, score: 1, matchedRules };
  }

  if (hasAnyPhrase(text, ["budget", "price", "under", "below", "less than", "within", "upto", "up to"])) {
    addRule(matchedRules, "price_or_budget_filter");
    if (availabilityInquiry) addRule(matchedRules, "availability_filter");
    return { intent: ChatbotIntent.PRODUCT_FILTER, score: 1, matchedRules };
  }

  if (availabilityInquiry) {
    addRule(matchedRules, "catalogue_availability_filter");
    return { intent: ChatbotIntent.PRODUCT_FILTER, score: 1, matchedRules };
  }

  if (hasAnyPhrase(text, ["category", "material", "color", "product"])) {
    addRule(matchedRules, "catalogue_attribute_search");
    return {
      intent: hasAnyPhrase(text, ["category", "material", "color"])
        ? ChatbotIntent.PRODUCT_FILTER
        : ChatbotIntent.PRODUCT_SEARCH,
      score: 1,
      matchedRules,
    };
  }

  if (hasAnyPhrase(text, ["search", "show", "find", "browse", "list"])) {
    addRule(matchedRules, "catalogue_search");
    if (productContext) {
      return { intent: ChatbotIntent.PRODUCT_SEARCH, score: 1, matchedRules };
    }
    return { intent: ChatbotIntent.AMBIGUOUS, score: 0.5, matchedRules: [...matchedRules, "missing_product_context"] };
  }

  if (hasAnyPhrase(text, ["search", "product", "category", "recommendation"])) {
    return {
      intent: ChatbotIntent.AMBIGUOUS,
      score: 0.5,
      matchedRules: ["insufficient_catalogue_context"],
    };
  }

  return { intent: ChatbotIntent.UNSUPPORTED, score: 0, matchedRules: ["no_supported_rule"] };
}
