export type NormalizedChatbotMessage = {
  original: string;
  normalized: string;
  tokens: string[];
};

type SynonymGroup = Readonly<Record<string, readonly string[]>>;

/** Extend these groups as new catalogue and customer vocabulary is approved. */
export const NORMALIZATION_SYNONYMS: SynonymGroup = {
  search: ["show", "find", "search", "browse", "list", "display", "kaatu", "kattu", "parunga"],
  product: ["product", "products", "item", "items", "piece", "pieces", "object", "objects", "porul", "porutkal"],
  category: ["category", "categories", "collection", "collections", "type", "types", "vagai"],
  material: ["material", "materials", "made of", "made from", "thayarippu"],
  color: ["color", "colour", "colors", "colours", "shade", "shades", "niram"],
  price: ["price", "prices", "cost", "costs", "rate", "rates", "amount", "vilai", "vila"],
  budget: ["budget", "affordable", "inexpensive", "cheap", "spend", "selavu", "budget la"],
  under: ["below", "less than", "upto", "up to", "within", "under", "kulla"],
  stock: ["stock", "stocks", "inventory", "available quantity", "irukka", "kidaikuma"],
  availability: ["availability", "available", "in stock", "ready", "stock iruka"],
  recommendation: ["recommend", "recommendation", "recommendations", "suggest", "suggestion", "suggestions", "best", "parindurai", "suggest pannunga"],
  shipping: ["shipping", "ship", "post", "courier", "anuppu"],
  delivery: ["delivery", "deliver", "arrival", "varum"],
  returns: ["return", "returns", "refund", "refunds", "exchange", "thiruppi"],
  payment: ["payment", "payments", "pay", "paid", "cash", "cod", "online payment", "panam"],
  lamp: ["lamps"],
  sculpture: ["sculptures"],
  idol: ["idols"],
  chair: ["chairs"],
  table: ["tables"],
  vase: ["vases"],
  mirror: ["mirrors"],
  decoration: ["decorations"],
  textile: ["textiles"],
  brass: ["brass", "pithalai"],
  wood: ["wood", "wooden", "maram"],
  stone: ["stone", "kal"],
  metal: ["metal", "metals"],
};

const escaped = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const synonymRules = Object.entries(NORMALIZATION_SYNONYMS)
  .flatMap(([canonical, synonyms]) => synonyms.map((synonym) => ({ canonical, synonym })))
  .sort((left, right) => right.synonym.length - left.synonym.length);

function normalizeCharacters(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[₹$€£]/g, " rupees ")
    .replace(/[^\p{L}\p{N}.]+/gu, " ")
    .replace(/(?<!\d)\.(?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applySynonyms(value: string) {
  let result = value;

  for (const { canonical, synonym } of synonymRules) {
    const pattern = new RegExp(`(^|\\s)${escaped(synonym)}(?=\\s|$)`, "g");
    result = result.replace(pattern, `$1${canonical}`);
  }

  return result.replace(/\s+/g, " ").trim();
}

/** Normalize user wording without discarding the original message. */
export function normalizeChatbotText(input: unknown): NormalizedChatbotMessage {
  const original = typeof input === "string" ? input : "";
  const normalized = applySynonyms(normalizeCharacters(original));

  return {
    original,
    normalized,
    tokens: normalized ? normalized.split(" ") : [],
  };
}
