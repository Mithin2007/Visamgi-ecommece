import type { NormalizedChatbotMessage } from "./normalize";
import type { ExtractedEntities, PriceRange } from "./types";

type Dictionary = Readonly<Record<string, readonly string[]>>;

const PRODUCT_KEYWORDS: Dictionary = {
  lamp: ["lamp", "lamps"],
  sculpture: ["sculpture", "sculptures"],
  idol: ["idol", "idols"],
  chair: ["chair", "chairs"],
  table: ["table", "tables"],
  vase: ["vase", "vases"],
  mirror: ["mirror", "mirrors"],
  decor: ["decor", "decoration", "decorations"],
  furniture: ["furniture"],
  textile: ["textile", "textiles"],
};

const MATERIALS: Dictionary = {
  brass: ["brass", "pithalai"],
  wood: ["wood", "wooden", "maram"],
  stone: ["stone", "kal"],
  bronze: ["bronze"],
  marble: ["marble"],
  ceramic: ["ceramic", "ceramics"],
  metal: ["metal", "metals"],
  cotton: ["cotton"],
  silk: ["silk"],
};

const COLORS: Dictionary = {
  black: ["black"],
  white: ["white"],
  brown: ["brown"],
  gold: ["gold", "golden"],
  silver: ["silver"],
  red: ["red"],
  blue: ["blue"],
  green: ["green"],
};

const CATEGORIES: Dictionary = {
  decor: ["decor", "decoration", "decorations"],
  furniture: ["furniture"],
  sculpture: ["sculpture", "sculptures"],
  textile: ["textile", "textiles"],
  lighting: ["lighting", "lights"],
  ritual: ["ritual", "rituals", "pooja"],
};

const FAQ_TOPICS: Dictionary = {
  shipping: ["shipping", "ship", "courier", "post"],
  delivery: ["delivery", "deliver", "arrival"],
  payment: ["payment", "payments", "pay", "cash", "cod"],
  returns: ["return", "returns", "refund", "refunds", "exchange"],
  how_to_buy: ["how to buy", "buy", "purchase", "order"],
  other_policy: ["policy", "policies"],
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function hasTerm(text: string, term: string) {
  return new RegExp(`(^|\\s)${escapeRegExp(term)}(?=\\s|$)`).test(text);
}

function findCanonicalTerm(text: string, dictionary: Dictionary) {
  for (const [canonical, variants] of Object.entries(dictionary)) {
    if (variants.some((variant) => hasTerm(text, variant))) return canonical;
  }
  return undefined;
}

function findAllCanonicalTerms(text: string, dictionary: Dictionary) {
  return Object.entries(dictionary)
    .filter(([, variants]) => variants.some((variant) => hasTerm(text, variant)))
    .map(([canonical]) => canonical);
}

const amount = `(\\d+(?:\\.\\d{1,2})?)`;
const money = `(?:rupees?|rs\\.?)?\\s*${amount}`;

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parsePriceRange(text: string): { priceRange?: PriceRange; budget?: number } {
  const between = new RegExp(`\\b(?:between|from)\\s+${money}\\s+(?:and|to)\\s+${money}\\b`).exec(text);
  if (between) {
    const min = toNumber(between[1]);
    const max = toNumber(between[2]);
    if (min !== undefined && max !== undefined && min <= max) return { priceRange: { min, max } };
  }

  const currencyRange = new RegExp(`\\b(?:rupees?|rs\\.?)\\s*${amount}\\s+(?:rupees?|rs\\.?)\\s*${amount}\\b`).exec(text);
  if (currencyRange) {
    const min = toNumber(currencyRange[1]);
    const max = toNumber(currencyRange[2]);
    if (min !== undefined && max !== undefined && min <= max) return { priceRange: { min, max } };
  }

  const maximum = new RegExp(`\\b(?:under|below|less than|within|upto|up to|budget)\\s+${money}\\b`).exec(text);
  if (maximum) {
    const max = toNumber(maximum[1]);
    if (max !== undefined) return { priceRange: { max }, budget: hasTerm(text, "budget") ? max : undefined };
  }

  const minimum = new RegExp(`\\b(?:above|over|more than)\\s+${money}\\b`).exec(text);
  if (minimum) {
    const min = toNumber(minimum[1]);
    if (min !== undefined) return { priceRange: { min } };
  }

  const budget = new RegExp(`\\bbudget\\s+(?:of\\s+)?${money}\\b`).exec(text);
  const budgetValue = budget ? toNumber(budget[1]) : undefined;
  return budgetValue === undefined ? {} : { budget: budgetValue, priceRange: { max: budgetValue } };
}

function extractAvailability(text: string): ExtractedEntities["availability"] {
  if (hasTerm(text, "out of stock") || hasTerm(text, "unavailable") || hasTerm(text, "sold out")) return "out_of_stock";
  if (hasTerm(text, "restock")) return "any";
  if (hasTerm(text, "in stock") || hasTerm(text, "available")) return "available";
  return undefined;
}

function extractFaqTopic(text: string): ExtractedEntities["faqTopic"] {
  for (const [topic, variants] of Object.entries(FAQ_TOPICS)) {
    if (variants.some((variant) => variant.includes(" ") ? text.includes(variant) : hasTerm(text, variant))) {
      return topic as ExtractedEntities["faqTopic"];
    }
  }
  return undefined;
}

/** Extract supported catalogue entities without querying external data. */
export function extractEntities(input: NormalizedChatbotMessage): ExtractedEntities {
  const text = typeof input?.normalized === "string" ? input.normalized.trim() : "";
  if (!text) return { keywords: [] };

  const { priceRange, budget } = parsePriceRange(text);
  const material = findCanonicalTerm(text, MATERIALS);
  const color = findCanonicalTerm(text, COLORS);
  const category = findCanonicalTerm(text, CATEGORIES);
  const faqTopic = extractFaqTopic(text);
  const availability = extractAvailability(text);

  return {
    keywords: findAllCanonicalTerms(text, PRODUCT_KEYWORDS),
    ...(category ? { category } : {}),
    ...(material ? { material } : {}),
    ...(color ? { color } : {}),
    ...(priceRange ? { priceRange } : {}),
    ...(budget !== undefined ? { budget } : {}),
    ...(availability ? { availability } : {}),
    ...(faqTopic ? { faqTopic } : {}),
  };
}
