// ============================================
// SMS Alert Engine - Event-Driven System
// Gateway Abstraction + Retry + Logging
// ============================================

import type {
  SmsGatewayProvider,
  SmsGatewayConfig,
  SmsLogEntry,
  SmsDeliveryStatus,
  SmsSendRequest,
  SmsSendResponse,
  SmsTriggerInput,
  SmsTriggerResult,
  SmsHistoryQuery,
  SmsHistoryResult,
} from "./types";
import { simulateDiseaseRisk, simulateIrrigation, simulatePestOutbreak, simulateRiskAdvisory } from "./ai-engine";

// ─── In-Memory Alert History Store ───
// In production, replace with a database (PostgreSQL, MongoDB, etc.)

let alertHistory: SmsLogEntry[] = [];
let idCounter = 1;

function generateId(): string {
  return `sms-${Date.now()}-${idCounter++}`;
}

// ─── Phone Number Validation ───

export function validatePhoneNumber(phone: string): { valid: boolean; normalized: string; errors: string[] } {
  const errors: string[] = [];
  let normalized = phone.replace(/[\s\-()]/g, "");

  // Must start with + and country code
  if (!normalized.startsWith("+")) {
    // Try to add India code
    if (normalized.startsWith("0")) {
      normalized = "+91" + normalized.slice(1);
    } else if (normalized.length === 10 && /^\d+$/.test(normalized)) {
      normalized = "+91" + normalized;
    } else {
      errors.push("Phone number must include country code (e.g., +91 for India)");
    }
  }

  // Validate format
  const phoneRegex = /^\+\d{10,15}$/;
  if (!phoneRegex.test(normalized)) {
    errors.push(`Invalid phone format: '${phone}'. Expected format: +91XXXXXXXXXX (10-15 digits after country code)`);
  }

  // India-specific validation
  if (normalized.startsWith("+91") && normalized.length !== 13) {
    errors.push("Indian phone numbers must have exactly 10 digits after +91");
  }

  return { valid: errors.length === 0, normalized, errors };
}

// ─── SMS Gateway Abstraction Layer ───

interface GatewayResponse {
  success: boolean;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

// Twilio Gateway
async function sendViaTwilio(phone: string, message: string, config: SmsGatewayConfig): Promise<GatewayResponse> {
  const accountSid = config.apiKey; // TWILIO_ACCOUNT_SID
  const authToken = config.apiSecret; // TWILIO_AUTH_TOKEN
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    return { 
      success: false, 
      errorCode: "AUTH_MISSING", 
      errorMessage: "Twilio credentials (SID, Token, or Phone) not configured." 
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    
    const params = new URLSearchParams();
    params.append("To", phone);
    params.append("From", fromPhone);
    params.append("Body", message);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.sid };
    } else {
      return { 
        success: false, 
        errorCode: data.code?.toString() || "TWILIO_ERROR", 
        errorMessage: data.message || "Twilio API error" 
      };
    }
  } catch (err) {
    return { success: false, errorCode: "NETWORK_ERROR", errorMessage: `Twilio API error: ${err}` };
  }
}

// Fast2SMS Gateway
async function sendViaFast2Sms(phone: string, message: string, config: SmsGatewayConfig): Promise<GatewayResponse> {
  const apiKey = config.apiKey || process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    return { success: false, errorCode: "AUTH_MISSING", errorMessage: "Fast2SMS API key not configured." };
  }

  try {
    // Fast2SMS BulkV2 Quick SMS API
    // Using simple phone normalization for Fast2SMS (remove +91 prefix)
    const cleanPhone = phone.replace("+91", "");
    
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        route: "q", // Quick SMS
        message: message,
        language: "english",
        numbers: cleanPhone
      }),
    });

    const data = await response.json();

    if (data.return) {
      return { success: true, messageId: data.request_id };
    } else {
      return { 
        success: false, 
        errorCode: "FAST2SMS_ERROR", 
        errorMessage: typeof data.message === 'string' ? data.message : JSON.stringify(data.message) || "Failed to send SMS via Fast2SMS" 
      };
    }
  } catch (err) {
    return { success: false, errorCode: "NETWORK_ERROR", errorMessage: `Fast2SMS API error: ${err}` };
  }
}

// Government SMS Gateway (NIC / CDAC)
async function sendViaGovtSms(phone: string, message: string, config: SmsGatewayConfig): Promise<GatewayResponse> {
  if (!config.apiKey) {
    return { success: false, errorCode: "AUTH_MISSING", errorMessage: "Govt SMS API key not configured." };
  }

  try {
    const simulatedSuccess = Math.random() > 0.1; // 90% success rate
    if (simulatedSuccess) {
      return { success: true, messageId: `GOV-${Date.now()}` };
    }
    return { success: false, errorCode: "GOV_RATE_LIMIT", errorMessage: "Simulated: Rate limit exceeded" };
  } catch (err) {
    return { success: false, errorCode: "NETWORK_ERROR", errorMessage: `Govt SMS API error: ${err}` };
  }
}

// Mock Gateway (always succeeds, for development/testing)
async function sendViaMock(phone: string, message: string, _config: SmsGatewayConfig): Promise<GatewayResponse> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 200));

  // Simulate occasional failures for testing retry logic (10% failure)
  const shouldFail = Math.random() < 0.1;
  if (shouldFail) {
    return { success: false, errorCode: "MOCK_FAILURE", errorMessage: "Simulated delivery failure for testing retry logic" };
  }

  console.log(`[MOCK SMS] To: ${phone} | Message: ${message}`);
  return { success: true, messageId: `MOCK-${Date.now()}` };
}

// Gateway dispatcher
export async function sendSms(phone: string, message: string, config?: SmsGatewayConfig): Promise<GatewayResponse> {
  const gwConfig: SmsGatewayConfig = config || getDefaultGatewayConfig();

  // Validate message length
  if (message.length > 160) {
    return { success: false, errorCode: "MSG_TOO_LONG", errorMessage: `Message exceeds 160 chars (${message.length} chars). Truncate or split.` };
  }

  switch (gwConfig.provider) {
    case "twilio":
      return sendViaTwilio(phone, message, gwConfig);
    case "fast2sms":
      return sendViaFast2Sms(phone, message, gwConfig);
    case "govt_sms":
      return sendViaGovtSms(phone, message, gwConfig);
    case "mock":
    default:
      return sendViaMock(phone, message, gwConfig);
  }
}

// ─── Gateway Configuration ───

let currentGatewayConfig: SmsGatewayConfig = {
  provider: "mock",
  senderId: "CROPAI",
};

export function getDefaultGatewayConfig(): SmsGatewayConfig {
  // Check environment variables for real gateway config
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const govtKey = process.env.GOVT_SMS_API_KEY;
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;

  if (twilioSid && twilioAuth && twilioPhone) {
    return { provider: "twilio", apiKey: twilioSid, apiSecret: twilioAuth, senderId: "CROPAI" };
  }
  if (fast2SmsKey) {
    return { provider: "fast2sms", apiKey: fast2SmsKey, senderId: "FSTSMS" };
  }
  if (govtKey) {
    return { provider: "govt_sms", apiKey: govtKey, senderId: "CROPAI" };
  }
  return currentGatewayConfig;
}

export function setGatewayConfig(config: SmsGatewayConfig): void {
  currentGatewayConfig = config;
}

export function getGatewayConfig(): SmsGatewayConfig {
  return { ...currentGatewayConfig };
}

// ─── Retry Logic ───

const RETRY_DELAYS_MS = [5000, 15000, 30000]; // 5s, 15s, 30s
const MAX_RETRIES = 3;

async function attemptDeliveryWithRetry(logEntry: SmsLogEntry, forcedGateway?: SmsGatewayProvider): Promise<SmsLogEntry> {
  const config = forcedGateway ? { ...getDefaultGatewayConfig(), provider: forcedGateway } : getDefaultGatewayConfig();
  let entry = { ...logEntry };

  while (entry.retryCount < entry.maxRetries) {
    entry.status = entry.retryCount === 0 ? "sent" : "retrying";
    entry.gatewayProvider = config.provider;

    const response = await sendSms(entry.phone, entry.message, config);

    if (response.success) {
      entry.status = "delivered";
      entry.deliveredAt = new Date().toISOString();
      entry.gatewayResponse = `MessageID: ${response.messageId}`;
      entry.errorMessage = undefined;
      entry.nextRetryAt = undefined;
      updateLogEntry(entry);
      return entry;
    }

    // Failed
    entry.retryCount++;
    entry.errorMessage = response.errorMessage;
    entry.gatewayResponse = `Error: ${response.errorCode} - ${response.errorMessage}`;

    if (entry.retryCount >= entry.maxRetries) {
      entry.status = "failed";
      entry.failedAt = new Date().toISOString();
      entry.nextRetryAt = undefined;
      updateLogEntry(entry);
      return entry;
    }

    // Schedule next retry
    const delay = RETRY_DELAYS_MS[entry.retryCount - 1] || 30000;
    entry.nextRetryAt = new Date(Date.now() + delay).toISOString();
    entry.status = "retrying";
    updateLogEntry(entry);

    // Wait before retry
    await new Promise((r) => setTimeout(r, Math.min(delay, 2000))); // Cap actual wait at 2s in demo
  }

  return entry;
}

function updateLogEntry(entry: SmsLogEntry): void {
  const idx = alertHistory.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    alertHistory[idx] = entry;
  }
}

// ─── Deduplication ───

const DEDUP_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function isDuplicate(phone: string, triggerEvent: string, cropType: string): boolean {
  const now = Date.now();
  return alertHistory.some(
    (entry) =>
      entry.phone === phone &&
      entry.triggerEvent === triggerEvent &&
      entry.cropType === cropType &&
      now - new Date(entry.timestamp).getTime() < DEDUP_WINDOW_MS &&
      entry.status !== "failed"
  );
}

// ─── Core: Send Single SMS with Full Pipeline ───

export async function sendSmsAlert(request: SmsSendRequest): Promise<SmsSendResponse> {
  // 1. Validate phone number
  const phoneValidation = validatePhoneNumber(request.phone);
  if (!phoneValidation.valid) {
    const failedEntry: SmsLogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      phone: request.phone,
      message: request.message,
      triggerEvent: request.triggerEvent || "Manual",
      priority: request.priority || "Normal",
      status: "failed",
      retryCount: 0,
      maxRetries: 0,
      gatewayProvider: request.gateway || getDefaultGatewayConfig().provider,
      errorMessage: `Phone validation failed: ${phoneValidation.errors.join("; ")}`,
      failedAt: new Date().toISOString(),
      cropType: request.cropType || "Unknown",
      region: request.region || "Unknown",
      season: request.season || "Unknown",
    };
    alertHistory.push(failedEntry);
    return { success: false, logEntry: failedEntry, validationErrors: phoneValidation.errors };
  }

  // 2. Validate message length
  if (request.message.length > 160) {
    const failedEntry: SmsLogEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      phone: phoneValidation.normalized,
      message: request.message,
      triggerEvent: request.triggerEvent || "Manual",
      priority: request.priority || "Normal",
      status: "failed",
      retryCount: 0,
      maxRetries: 0,
      gatewayProvider: request.gateway || getDefaultGatewayConfig().provider,
      errorMessage: `Message too long: ${request.message.length}/160 chars`,
      failedAt: new Date().toISOString(),
      cropType: request.cropType || "Unknown",
      region: request.region || "Unknown",
      season: request.season || "Unknown",
    };
    alertHistory.push(failedEntry);
    return { success: false, logEntry: failedEntry, validationErrors: [`Message exceeds 160 characters (${request.message.length})`] };
  }

  // 3. Create log entry
  const logEntry: SmsLogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    phone: phoneValidation.normalized,
    message: request.message,
    triggerEvent: request.triggerEvent || "Manual",
    priority: request.priority || "Normal",
    status: "queued",
    retryCount: 0,
    maxRetries: MAX_RETRIES,
    gatewayProvider: request.gateway || getDefaultGatewayConfig().provider,
    cropType: request.cropType || "Unknown",
    region: request.region || "Unknown",
    season: request.season || "Unknown",
  };
  alertHistory.push(logEntry);

  // 4. Attempt delivery with retry
  const result = await attemptDeliveryWithRetry(logEntry, request.gateway);

  return { success: result.status === "delivered", logEntry: result };
}

// ─── Event-Based Trigger Engine ───

interface ThresholdCheck {
  event: string;
  threshold: string;
  currentValue: string;
  triggered: boolean;
  message: string;
  priority: "Normal" | "High" | "Critical";
}

function evaluateThresholds(input: SmsTriggerInput): ThresholdCheck[] {
  const checks: ThresholdCheck[] = [];
  const temp = input.temperature ?? 30;
  const humidity = input.humidity ?? 70;
  const rainfall = input.recentRainfall ?? 10;
  const soil = input.soilType ?? "Alluvial";

  // 1. Disease Risk Check
  const diseaseResult = simulateDiseaseRisk({
    cropType: input.cropType,
    region: input.region,
    temperature: temp,
    humidity,
    rainfall,
    season: input.season,
  });

  const diseaseTriggered = diseaseResult.riskPercentage > 55;
  checks.push({
    event: "High Disease Risk",
    threshold: "> 55% risk",
    currentValue: `${diseaseResult.riskPercentage}% (${diseaseResult.riskLevel})`,
    triggered: diseaseTriggered,
    message: truncateMsg(`Alert: ${diseaseResult.riskLevel} disease risk (${diseaseResult.riskPercentage}%) for ${input.cropType} in ${input.region}. ${diseaseResult.riskLevel === "High" ? "Spray fungicide now." : "Monitor closely."}`),
    priority: diseaseResult.riskPercentage > 70 ? "Critical" : "High",
  });

  // 2. Pest Outbreak Check
  const pestResult = simulatePestOutbreak({
    region: input.region,
    season: input.season,
    temperature: temp,
    humidity,
    recentRainfall: rainfall,
  });

  const pestTriggered = pestResult.outbreakProbability > 50;
  checks.push({
    event: "Pest Outbreak Warning",
    threshold: "> 50% outbreak probability",
    currentValue: `${pestResult.outbreakProbability}% (${pestResult.riskZone})`,
    triggered: pestTriggered,
    message: truncateMsg(`Pest alert in ${input.region}! ${pestResult.riskZone} risk. Check ${input.cropType} fields. Use traps and bio-pesticide.`),
    priority: pestResult.outbreakProbability > 70 ? "Critical" : "High",
  });

  // 3. Soil Moisture / Irrigation Check
  const irrigResult = simulateIrrigation({
    cropType: input.cropType,
    region: input.region,
    soilType: soil,
    temperature: temp,
    humidity,
    recentRainfall: rainfall,
    season: input.season,
  });

  const irrigTriggered = irrigResult.irrigationNeed === "Heavy Irrigation";
  checks.push({
    event: "Low Soil Moisture",
    threshold: "Heavy irrigation needed",
    currentValue: `Moisture ${irrigResult.soilMoisturePercent}% - ${irrigResult.irrigationNeed}`,
    triggered: irrigTriggered,
    message: truncateMsg(`${input.cropType}: Soil moisture low (${irrigResult.soilMoisturePercent}%). Irrigate now. ${irrigResult.waterRequired_liters}L/acre needed.`),
    priority: "High",
  });

  // 4. Crop Avoidance Advisory Check
  const advisoryResult = simulateRiskAdvisory({
    region: input.region,
    season: input.season,
  });

  const avoidCrop = advisoryResult.cropsToAvoid.find(
    (c) => c.cropName === input.cropType && c.riskScore > 60
  );
  const avoidTriggered = !!avoidCrop;
  checks.push({
    event: "Crop Avoidance Advisory",
    threshold: "> 60 risk score for chosen crop",
    currentValue: avoidCrop ? `Risk score ${avoidCrop.riskScore} (${avoidCrop.riskLevel})` : "Crop is suitable",
    triggered: avoidTriggered,
    message: truncateMsg(`Advisory: ${input.cropType} is risky in ${input.region} this ${input.season}. Risk: ${avoidCrop?.riskScore ?? 0}%. Try safer crops.`),
    priority: "Critical",
  });

  // 5. General Weather Extreme Check
  const weatherExtreme = temp > 42 || temp < 5 || humidity > 95 || rainfall > 50;
  checks.push({
    event: "Weather Extreme Alert",
    threshold: "Temp >42°C/<5°C, Humidity >95%, Rain >50mm",
    currentValue: `Temp: ${temp}°C, Humidity: ${humidity}%, Rain: ${rainfall}mm`,
    triggered: weatherExtreme,
    message: truncateMsg(`Weather alert ${input.region}: ${temp > 42 ? "Extreme heat" : temp < 5 ? "Frost warning" : humidity > 95 ? "Very high humidity" : "Heavy rainfall"}. Protect ${input.cropType} crop.`),
    priority: "Critical",
  });

  return checks;
}

function truncateMsg(msg: string): string {
  if (msg.length <= 160) return msg;
  return msg.slice(0, 157) + "...";
}

export async function triggerEventAlerts(input: SmsTriggerInput): Promise<SmsTriggerResult> {
  const checks = evaluateThresholds(input);
  const triggeredAlerts: SmsLogEntry[] = [];
  let skippedDuplicates = 0;

  for (const check of checks) {
    if (!check.triggered) continue;

    // Deduplication check
    if (isDuplicate(input.farmerPhone, check.event, input.cropType)) {
      skippedDuplicates++;
      continue;
    }

    // Send the alert
    const result = await sendSmsAlert({
      phone: input.farmerPhone,
      message: check.message,
      priority: check.priority,
      triggerEvent: check.event,
      cropType: input.cropType,
      region: input.region,
      season: input.season,
    });

    triggeredAlerts.push(result.logEntry);
  }

  return {
    triggeredAlerts,
    skippedDuplicates,
    totalEvaluated: checks.length,
    thresholds: checks.map((c) => ({
      event: c.event,
      threshold: c.threshold,
      currentValue: c.currentValue,
      triggered: c.triggered,
    })),
  };
}

// ─── History & Monitoring ───

export function getAlertHistory(query?: SmsHistoryQuery): SmsHistoryResult {
  let logs = [...alertHistory];

  // Apply filters
  if (query?.phone) {
    const normalized = validatePhoneNumber(query.phone).normalized;
    logs = logs.filter((l) => l.phone === normalized || l.phone === query.phone);
  }
  if (query?.status) {
    logs = logs.filter((l) => l.status === query.status);
  }
  if (query?.priority) {
    logs = logs.filter((l) => l.priority === query.priority);
  }
  if (query?.fromDate) {
    const from = new Date(query.fromDate).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() >= from);
  }
  if (query?.toDate) {
    const to = new Date(query.toDate).getTime();
    logs = logs.filter((l) => new Date(l.timestamp).getTime() <= to);
  }

  // Sort newest first
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Limit
  if (query?.limit && query.limit > 0) {
    logs = logs.slice(0, query.limit);
  }

  // Calculate stats from full history (not filtered)
  const total = alertHistory.length;
  const delivered = alertHistory.filter((l) => l.status === "delivered").length;
  const failed = alertHistory.filter((l) => l.status === "failed").length;
  const retrying = alertHistory.filter((l) => l.status === "retrying").length;
  const queued = alertHistory.filter((l) => l.status === "queued").length;
  const deliveryRate = total > 0 ? Math.round((delivered / total) * 100 * 10) / 10 : 0;
  const avgRetries = total > 0 ? Math.round((alertHistory.reduce((sum, l) => sum + l.retryCount, 0) / total) * 10) / 10 : 0;

  return {
    logs,
    stats: { total, delivered, failed, retrying, queued, deliveryRate, avgRetries },
  };
}

export function clearAlertHistory(): void {
  alertHistory = [];
}

// ─── Retry Failed Messages ───

export async function retryFailedMessages(): Promise<{ retried: number; succeeded: number; stillFailed: number }> {
  const failed = alertHistory.filter((l) => l.status === "failed");
  let retried = 0;
  let succeeded = 0;
  let stillFailed = 0;

  for (const entry of failed) {
    retried++;
    // Reset retry count and attempt again
    entry.retryCount = 0;
    entry.maxRetries = MAX_RETRIES;
    entry.status = "queued";
    entry.failedAt = undefined;
    entry.errorMessage = undefined;

    const result = await attemptDeliveryWithRetry(entry);
    if (result.status === "delivered") {
      succeeded++;
    } else {
      stillFailed++;
    }
  }

  return { retried, succeeded, stillFailed };
}
