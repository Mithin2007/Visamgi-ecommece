import { ChatbotIntent } from "./types";
import type { ChatbotRequest, ChatbotResponse, FallbackResponse } from "./types";
import { searchCatalogue } from "./catalog";
import { extractEntities } from "./entities";
import { detectIntent } from "./intents";
import { normalizeChatbotText } from "./normalize";
import { recommendProducts } from "./recommendations";
import {
  buildClarificationResponse,
  buildFaqResponse,
  buildGreetingResponse,
  buildNoResultsResponse,
  buildPrivateDataResponse,
  buildProductInformationResponse,
  buildProductSearchResponse,
  buildRecommendationResponse,
  buildUnsupportedResponse,
} from "./responses";
import { lookupFaq } from "./faqs";

const MAX_MESSAGE_LENGTH = 1000;

const PRIVATE_DATA_PATTERNS = [
  /\b(?:my|our)\s+(?:accounts?|addresses?|carts?|orders?|profiles?|transactions?|payments?)\b/,
  /\b(?:orders?|carts?|accounts?|addresses?)\s+(?:status|details|history|number)\b/,
  /\b(?:track|cancel|change|update)\s+(?:my\s+)?(?:orders?|addresses?|accounts?|carts?)\b/,
  /\b(?:customer|user)\s+(?:data|details|information)\b/,
];

const catalogueUnavailableResponse = (): FallbackResponse => ({
  kind: "fallback",
  message: "The VISAMGI catalogue is temporarily unavailable. Please try again shortly.",
  suggestions: ["Ask about VISAMGI store policies", "Try a product search again later"],
});

function isPrivateDataRequest(text: string) {
  return PRIVATE_DATA_PATTERNS.some((pattern) => pattern.test(text));
}

/** Run the deterministic VISAMGI chatbot pipeline for one public message. */
export async function processChatbotMessage(request: ChatbotRequest): Promise<ChatbotResponse> {
  const normalized = normalizeChatbotText(request?.message);
  const text = normalized.normalized;

  if (!text) return buildClarificationResponse("Please tell me what you would like to find or know about VISAMGI.");
  if (text.length > MAX_MESSAGE_LENGTH) {
    return buildClarificationResponse("Please shorten your message to 1,000 characters or fewer.");
  }
  if (isPrivateDataRequest(text)) return buildPrivateDataResponse();

  const entities = extractEntities(normalized);
  const detected = detectIntent(normalized);

  switch (detected.intent) {
    case ChatbotIntent.GREETING:
      return buildGreetingResponse();
    case ChatbotIntent.STORE_FAQ:
      return buildFaqResponse(lookupFaq(normalized, entities));
    case ChatbotIntent.UNSUPPORTED:
      return buildUnsupportedResponse();
    case ChatbotIntent.AMBIGUOUS:
      return buildClarificationResponse();
    case ChatbotIntent.PRODUCT_INFORMATION:
    case ChatbotIntent.PRODUCT_SEARCH:
    case ChatbotIntent.PRODUCT_FILTER:
    case ChatbotIntent.PRODUCT_RECOMMENDATION:
      break;
    default:
      return buildUnsupportedResponse();
  }

  try {
    const catalogue = await searchCatalogue(normalized, entities);

    if (detected.intent === ChatbotIntent.PRODUCT_INFORMATION) {
      if (catalogue.products.length === 1) return buildProductInformationResponse(catalogue.products[0]);
      if (catalogue.products.length > 1) {
        return buildClarificationResponse("I found several VISAMGI products. Please share the exact product name or a more specific detail.", ["product"]);
      }
      return buildNoResultsResponse(entities);
    }

    if (detected.intent === ChatbotIntent.PRODUCT_RECOMMENDATION) {
      return buildRecommendationResponse(recommendProducts(normalized, entities, catalogue));
    }

    return buildProductSearchResponse(catalogue, detected.intent);
  } catch {
    return catalogueUnavailableResponse();
  }
}
