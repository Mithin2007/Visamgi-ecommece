const internalTerms=/\b(development|dev(?:elopment)?-only|seed|test|verification|forthcoming)\b/i;

export function customerName(value:string,fallback:string){
  const cleaned=value.replace(/^development\s+/i,"").replace(/\bseed\b/ig,"").replace(/\s{2,}/g," ").trim();
  return !cleaned||internalTerms.test(cleaned)?fallback:cleaned;
}

export function customerDescription(value:string|null|undefined){
  return value&& !internalTerms.test(value)?value:null;
}
