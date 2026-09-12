import type { NormalizedChatbotMessage } from "./normalize";
import type { ExtractedEntities, FAQResult } from "./types";

type FAQTopic = FAQResult["topic"];

type FAQEntry = {
  question: string;
  answer: string;
  source: FAQResult["source"];
};

const FAQ_ENTRIES: Readonly<Record<FAQTopic, FAQEntry>> = {
  how_to_buy: {
    question: "How do I buy from VISAMGI?",
    answer: "Browse the VISAMGI collection, open a product page, choose an available option, add it to your bag or use Buy now, then continue through checkout.",
    source: "approved_store_policy",
  },
  payment: {
    question: "What payment methods does VISAMGI accept?",
    answer: "The current checkout offers cash on delivery where it is available. Online payments are not yet available.",
    source: "approved_store_policy",
  },
  shipping: {
    question: "How does VISAMGI shipping work?",
    answer: "Shipping availability and charges are confirmed during checkout for the delivery address. The currently supported shipping region is validated there.",
    source: "live_shipping_configuration",
  },
  delivery: {
    question: "When will my VISAMGI order arrive?",
    answer: "VISAMGI presents standard delivery during checkout. Any configured delivery estimate is shown after a delivery address is selected.",
    source: "live_shipping_configuration",
  },
  returns: {
    question: "What is VISAMGI's return or refund policy?",
    answer: "I do not have verified VISAMGI information about returns, refunds, or exchanges. Please contact VISAMGI directly for the approved policy.",
    source: "approved_store_policy",
  },
  other_policy: {
    question: "How can I contact VISAMGI?",
    answer: "You can visit VISAMGI at All Rise, 24 Sundaresan Iyer Layout, Trichy Road, near Cafe, Coimbatore, Tamil Nadu 641018, or call 099809 74222. Store hours are shown as opening at 10:30 AM.",
    source: "approved_store_policy",
  },
};

const UNDOCUMENTED_TOPIC: FAQTopic = "other_policy";

function topicFromText(text: string): FAQTopic {
  if (/\b(?:shipping|ship|courier|post)\b/.test(text)) return "shipping";
  if (/\b(?:delivery|deliver|arrival)\b/.test(text)) return "delivery";
  if (/\b(?:payment|pay|cash|cod)\b/.test(text)) return "payment";
  if (/\b(?:return|returns|refund|refunds|exchange)\b/.test(text)) return "returns";
  if (text.includes("how to buy") || /\b(?:buy|purchase|order)\b/.test(text)) return "how_to_buy";
  if (/\b(?:contact|visit|address|phone|instagram|call)\b/.test(text)) return "other_policy";
  return UNDOCUMENTED_TOPIC;
}

/** Return only verified or explicitly unavailable VISAMGI FAQ information. */
export function lookupFaq(
  input: NormalizedChatbotMessage,
  entities?: ExtractedEntities,
): FAQResult {
  const text = typeof input?.normalized === "string" ? input.normalized.trim() : "";
  const topic = entities?.faqTopic ?? topicFromText(text);

  if (!text && !entities?.faqTopic) {
    return {
      topic: UNDOCUMENTED_TOPIC,
      question: "What would you like to know about VISAMGI?",
      answer: "I do not have enough information to identify a VISAMGI policy question. Ask about buying, payment, shipping, delivery, returns, or contact details.",
      source: "approved_store_policy",
    };
  }

  return {
    topic,
    ...FAQ_ENTRIES[topic],
  };
}

export const verifiedFAQs = FAQ_ENTRIES;
