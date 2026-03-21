/**
 * Source Service
 * Handles topic detection and mapping to trusted agricultural sources.
 */

export type Topic = "disease" | "market" | "soil" | "weather" | "general";

const SOURCE_MAP: Record<Topic, string[]> = {
  disease: [
    "ICAR (Indian Council of Agricultural Research)",
    "Krishi Vigyan Kendra (KVK)"
  ],
  market: [
    "Agmarknet",
    "Ministry of Agriculture"
  ],
  soil: [
    "Soil Health Card Scheme",
    "Agriculture Department"
  ],
  weather: [
    "IMD (Indian Meteorological Department)",
    "Weather Data Services"
  ],
  general: [
    "Ministry of Agriculture",
    "National Portal of India"
  ]
};

/**
 * Detects the topic of a query string.
 */
export function detectTopic(query: string): Topic {
  const q = query.toLowerCase();
  
  if (/disease|blight|infection|sick|bimar|rog|beemari|pest|insect|pesticide|fungi|virus/i.test(q)) {
    return "disease";
  }
  
  if (/price|market|sell|store|mandi|bazar|cost|worth|quitnal|profit|income|money/i.test(q)) {
    return "market";
  }
  
  if (/soil|land|mitti|fertilizer|manure|npk|nitrogen|ph|clay|sandy/i.test(q)) {
    return "soil";
  }
  
  if (/weather|rain|temp|heat|monsoon|storm|flood|drought|humidity|forecast/i.test(q)) {
    return "weather";
  }
  
  return "general";
}

/**
 * Gets sources for a given topic.
 */
export function getSources(topic: Topic): string[] {
  return SOURCE_MAP[topic] || SOURCE_MAP.general;
}

/**
 * Formats sources for Chatbot (Text UI).
 */
export function formatChatbotSources(sources: string[]): string {
  if (!sources.length) return "";
  return "\n\n📚 Sources:\n" + sources.map(s => `• ${s}`).join("\n");
}

/**
 * Formats sources for Voice Assistant (Spoken).
 */
export function formatVoiceSources(sources: string[]): string {
  if (!sources.length) return "";
  const joined = sources.join(" and ");
  return ` This information is based on ${joined}.`;
}
