// ============================================
// AI Crop Intelligence Platform - Core Types
// ============================================

export interface DiseaseDetectionInput {
  imageBase64: string;
  cropType: string;
}

export interface DiseaseDetectionResult {
  diseaseName: string;
  severity: "Low" | "Medium" | "High";
  confidence: number;
  description: string;
  remedies: string[];
  preventiveMeasures: string[];
}

export interface DiseaseRiskInput {
  language?: string;
  cropType: string;
  region: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  season: string;
}

export interface DiseaseRiskResult {
  riskPercentage: number;
  riskLevel: "Low" | "Medium" | "High" | string;
  topDiseases: { name: string; probability: number }[];
  factors: { factor: string; impact: "Positive" | "Negative"; detail: string }[];
  recommendation: string;
  forecastDays: number;
}

export interface ProfitPredictionInput {
  language?: string;
  cropType: string;
  region: string;
  acreage: number;
  season: string;
  irrigationType: string;
  soilType: string;
}

export interface ProfitPredictionResult {
  expectedYieldPerAcre: number;
  yieldUnit: string;
  expectedMarketPrice: number;
  marketPriceRange: { low: number; high: number };
  inputCostPerAcre: number;
  costBreakdown: { item: string; cost: number }[];
  grossRevenuePerAcre: number;
  profitPerAcre: number;
  profitRange: { low: number; high: number };
  confidenceScore: number;
  riskFactors: string[];
}

export interface PriceForecastInput {
  language?: string;
  cropType: string;
  region: string;
  currentPrice: number;
  quantityQuintals: number;
  storageCostPerDay: number;
}

export interface PriceForecastResult {
  decision: "Sell Now" | "Store";
  storeDays: number;
  currentPrice: number;
  forecastedPrice: number;
  priceChange: number;
  expectedGainLoss: number;
  storageCost: number;
  spoilageRisk: "Low" | "Medium" | "High";
  priceTrend: "Rising" | "Stable" | "Falling";
  priceTimeline: { day: number; price: number }[];
  reasoning: string;
}

export interface CropRiskAdvisory {
  cropName: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Very High";
  reasons: string[];
  diseaseRisk: number;
  profitVolatility: number;
  climateMismatch: number;
}

export interface RiskAdvisoryInput {
  language?: string;
  region: string;
  season: string;
}

export interface RiskAdvisoryResult {
  cropsToAvoid: CropRiskAdvisory[];
  safeCrops: { name: string; reason: string }[];
  seasonalInsight: string;
}

export interface DecisionSummary {
  diseaseRisk: DiseaseRiskResult | null;
  profitEstimate: ProfitPredictionResult | null;
  sellStoreAdvice: PriceForecastResult | null;
  riskAdvisory: RiskAdvisoryResult | null;
  irrigation: IrrigationResult | null;
  pestOutbreak: PestOutbreakResult | null;
}

// ─── Smart Irrigation ───

export interface IrrigationInput {
  language?: string;
  cropType: string;
  region: string;
  soilType: string;
  temperature: number;
  humidity: number;
  recentRainfall: number;
  season: string;
}

export interface IrrigationResult {
  soilMoisturePercent: number;
  irrigationNeed: "No Irrigation" | "Light Irrigation" | "Heavy Irrigation";
  pumpStatus: "ON" | "OFF";
  pumpDurationMinutes: number;
  waterRequired_liters: number;
  waterSaved_percent: number;
  costSaving_rs: number;
  overIrrigationScore: number;
  recommendation: string;
  schedule: { day: string; action: string; waterLiters: number }[];
}

// ─── Pest & Disease Outbreak Forecasting ───

export interface PestOutbreakInput {
  language?: string;
  region: string;
  season: string;
  temperature: number;
  humidity: number;
  recentRainfall: number;
}

export interface PestOutbreakResult {
  outbreakProbability: number;
  riskZone: "Low" | "Moderate" | "High" | string;
  affectedCrops: { crop: string; riskPercent: number; pest: string }[];
  districtAlerts: { district: string; level: "Low" | "Moderate" | "High" | string; pest: string }[];
  preventiveAdvisory: string[];
  historicalComparison: string;
}

// ─── SMS Alert ───

export interface SmsAlertInput {
  cropType: string;
  region: string;
  season: string;
  farmerPhone?: string;
  language?: string;
}

export interface SmsAlert {
  id: string;
  timestamp: string;
  phone: string;
  message: string;
  triggerEvent: string;
  priority: "Normal" | "High" | "Critical";
  delivered: boolean;
}

export interface SmsAlertResult {
  alerts: SmsAlert[];
  totalSent: number;
  criticalCount: number;
  gateway: string;
}

// ─── Advanced SMS System ───

export type SmsGatewayProvider = "twilio" | "govt_sms" | "mock";
export type SmsDeliveryStatus = "queued" | "sent" | "delivered" | "failed" | "retrying";

export interface SmsGatewayConfig {
  provider: SmsGatewayProvider;
  apiKey?: string;
  apiSecret?: string;
  senderId?: string;
  baseUrl?: string;
}

export interface SmsLogEntry {
  id: string;
  timestamp: string;
  phone: string;
  message: string;
  triggerEvent: string;
  priority: "Normal" | "High" | "Critical";
  status: SmsDeliveryStatus;
  retryCount: number;
  maxRetries: number;
  gatewayProvider: SmsGatewayProvider;
  gatewayResponse?: string;
  nextRetryAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  errorMessage?: string;
  cropType: string;
  region: string;
  season: string;
}

export interface SmsSendRequest {
  phone: string;
  message: string;
  priority?: "Normal" | "High" | "Critical";
  triggerEvent?: string;
  cropType?: string;
  region?: string;
  season?: string;
}

export interface SmsSendResponse {
  success: boolean;
  logEntry: SmsLogEntry;
  validationErrors?: string[];
}

export interface SmsTriggerInput {
  cropType: string;
  region: string;
  season: string;
  farmerPhone: string;
  temperature?: number;
  humidity?: number;
  recentRainfall?: number;
  soilType?: string;
}

export interface SmsTriggerResult {
  triggeredAlerts: SmsLogEntry[];
  skippedDuplicates: number;
  totalEvaluated: number;
  thresholds: { event: string; threshold: string; currentValue: string; triggered: boolean }[];
}

export interface SmsHistoryQuery {
  phone?: string;
  status?: SmsDeliveryStatus;
  priority?: "Normal" | "High" | "Critical";
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export interface SmsHistoryResult {
  logs: SmsLogEntry[];
  stats: {
    total: number;
    delivered: number;
    failed: number;
    retrying: number;
    queued: number;
    deliveryRate: number;
    avgRetries: number;
  };
}

// ─── Chatbot ───

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatbotInput {
  message: string;
  cropType?: string;
  region?: string;
  season?: string;
  language?: string;
  history?: ChatMessage[];
}

export interface ChatbotResult {
  reply: string;
  suggestions: string[];
}

export type CropType =
  | "Rice"
  | "Wheat"
  | "Cotton"
  | "Sugarcane"
  | "Tomato"
  | "Potato"
  | "Onion"
  | "Maize"
  | "Soybean"
  | "Groundnut";

export type Region =
  | "Andhra Pradesh"
  | "Arunachal Pradesh"
  | "Assam"
  | "Bihar"
  | "Chhattisgarh"
  | "Goa"
  | "Gujarat"
  | "Haryana"
  | "Himachal Pradesh"
  | "Jharkhand"
  | "Karnataka"
  | "Kerala"
  | "Madhya Pradesh"
  | "Maharashtra"
  | "Manipur"
  | "Meghalaya"
  | "Mizoram"
  | "Nagaland"
  | "Odisha"
  | "Punjab"
  | "Rajasthan"
  | "Sikkim"
  | "Tamil Nadu"
  | "Telangana"
  | "Tripura"
  | "Uttar Pradesh"
  | "Uttarakhand"
  | "West Bengal"
  | "Delhi"
  | "Jammu & Kashmir";

export type Season = "Kharif" | "Rabi" | "Zaid";

export const CROP_LIST: CropType[] = [
  "Rice", "Wheat", "Cotton", "Sugarcane", "Tomato",
  "Potato", "Onion", "Maize", "Soybean", "Groundnut",
];

export const REGION_LIST: Region[] = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir",
];

export const SEASON_LIST: Season[] = ["Kharif", "Rabi", "Zaid"];
