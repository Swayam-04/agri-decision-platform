// ============================================
// AI Simulation Engine - Mock Predictions
// Realistic stochastic simulations for demo
// ============================================

import type {
  DiseaseDetectionResult,
  DiseaseRiskInput,
  DiseaseRiskResult,
  ProfitPredictionInput,
  ProfitPredictionResult,
  PriceForecastInput,
  PriceForecastResult,
  RiskAdvisoryInput,
  RiskAdvisoryResult,
  IrrigationInput,
  IrrigationResult,
  PestOutbreakInput,
  PestOutbreakResult,
  SmsAlertInput,
  SmsAlertResult,
  SmsAlert,
  ChatbotInput,
  ChatbotResult,
} from "./types";

// Seeded randomness for reproducibility given inputs
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: string, offset = 0): number {
  const h = hash(seed + offset.toString());
  return (h % 10000) / 10000;
}

// ─── Disease Detection (Vision AI Mock) ───

const DISEASE_DB: Record<string, { diseases: { name: string; severity: "Low" | "Medium" | "High"; description: string; remedies: string[]; preventive: string[] }[] }> = {
  Rice: {
    diseases: [
      { name: "Rice Blast", severity: "High", description: "Fungal disease causing diamond-shaped lesions on leaves, leading to significant yield loss if untreated.", remedies: ["Apply Tricyclazole 75% WP @ 0.6g/L", "Use Isoprothiolane 40% EC", "Remove infected plant debris"], preventive: ["Use resistant varieties (e.g., Pusa Basmati 1509)", "Avoid excess nitrogen fertilization", "Maintain proper spacing"] },
      { name: "Bacterial Leaf Blight", severity: "Medium", description: "Bacterial infection causing yellowing and wilting of leaves from the tips, reducing photosynthesis.", remedies: ["Apply Streptocycline @ 0.01%", "Use copper oxychloride 50% WP", "Drain excess water from fields"], preventive: ["Use certified disease-free seeds", "Balanced fertilizer application", "Avoid clipping seedling tips during transplanting"] },
      { name: "Brown Spot", severity: "Low", description: "Fungal disease causing oval brown spots on leaves, generally occurs in nutrient-deficient soils.", remedies: ["Apply Mancozeb 75% WP @ 2.5g/L", "Foliar spray of potassium", "Improve soil nutrition"], preventive: ["Ensure balanced soil nutrients", "Seed treatment with fungicides", "Proper water management"] },
    ],
  },
  Wheat: {
    diseases: [
      { name: "Wheat Rust (Yellow)", severity: "High", description: "Stripe rust causing yellow-orange pustules in stripes along leaves. Can reduce yield by 40-100%.", remedies: ["Apply Propiconazole 25% EC @ 0.1%", "Use Tebuconazole 250 EC", "Remove volunteer wheat plants"], preventive: ["Grow resistant varieties", "Timely sowing (avoid late sowing)", "Monitor fields from January onwards"] },
      { name: "Powdery Mildew", severity: "Medium", description: "White powdery fungal growth on leaves and stems, reducing grain quality.", remedies: ["Spray Sulfur 80% WP @ 2g/L", "Apply Karathane 48% EC", "Ensure adequate air circulation"], preventive: ["Avoid dense planting", "Use resistant cultivars", "Balanced nitrogen application"] },
    ],
  },
  Tomato: {
    diseases: [
      { name: "Early Blight", severity: "Medium", description: "Concentric ring-shaped brown spots on lower leaves, spreading upward. Causes defoliation and fruit rot.", remedies: ["Apply Chlorothalonil 75% WP", "Use Mancozeb spray biweekly", "Remove infected lower leaves"], preventive: ["Crop rotation with non-solanaceous crops", "Mulching to prevent soil splash", "Adequate plant spacing"] },
      { name: "Late Blight", severity: "High", description: "Water-soaked lesions turning dark brown/black. Can destroy entire crop within days under favorable conditions.", remedies: ["Apply Metalaxyl + Mancozeb (Ridomil Gold)", "Use Cymoxanil-based fungicides", "Destroy infected plants immediately"], preventive: ["Avoid overhead irrigation", "Use disease-free transplants", "Plant resistant varieties"] },
      { name: "Leaf Curl Virus", severity: "High", description: "Upward curling and yellowing of leaves caused by whitefly-transmitted virus. Stunted growth and poor fruiting.", remedies: ["Control whiteflies with Imidacloprid", "Remove and destroy infected plants", "Use yellow sticky traps"], preventive: ["Use virus-resistant varieties", "Install insect-proof net houses", "Avoid planting near old infected crops"] },
    ],
  },
  Cotton: {
    diseases: [
      { name: "Cotton Bollworm Damage", severity: "High", description: "Helicoverpa larvae bore into bolls, causing yield loss up to 50%. Major pest across all cotton-growing regions.", remedies: ["Apply NPV (Nuclear Polyhedrosis Virus)", "Use Emamectin benzoate 5% SG", "Install pheromone traps"], preventive: ["Bt cotton varieties provide partial resistance", "Refuge crop planting", "Early sowing to avoid peak pest period"] },
    ],
  },
  Potato: {
    diseases: [
      { name: "Late Blight", severity: "High", description: "Phytophthora infestans causing dark water-soaked patches on leaves and tuber rot. Devastating under cool, wet conditions.", remedies: ["Apply Cymoxanil + Mancozeb", "Use Metalaxyl-based fungicides", "Destroy infected plant material"], preventive: ["Use certified disease-free seed potatoes", "Hill up soil to protect tubers", "Avoid irrigation during cloudy weather"] },
      { name: "Black Scurf", severity: "Medium", description: "Rhizoctonia solani causing black crusty spots on tubers. Affects tuber quality and market value.", remedies: ["Seed treatment with Carbendazim", "Apply Trichoderma to soil", "Remove infected tubers before storage"], preventive: ["Crop rotation (3-year cycle)", "Use clean seed stock", "Avoid waterlogged conditions"] },
    ],
  },
  Sugarcane: {
    diseases: [
      { name: "Red Rot", severity: "High", description: "Colletotrichum falcatum causing reddening of internal stalk tissue. Major disease in subtropical sugarcane belts.", remedies: ["Remove and burn infected stalks", "Treat setts with Carbendazim", "Use hot water treatment for setts"], preventive: ["Plant resistant varieties", "Avoid waterlogging", "Use disease-free seed cane"] },
    ],
  },
  Onion: {
    diseases: [
      { name: "Purple Blotch", severity: "Medium", description: "Alternaria porri causing purple-brown lesions on leaves. Reduces bulb size and storage quality.", remedies: ["Apply Mancozeb 75% WP @ 2.5g/L", "Spray Chlorothalonil at 10-day intervals", "Remove crop debris"], preventive: ["Crop rotation", "Proper plant spacing", "Avoid excess irrigation"] },
    ],
  },
  Maize: {
    diseases: [
      { name: "Fall Armyworm", severity: "High", description: "Spodoptera frugiperda larvae feed on leaves and ears, causing severe defoliation and yield loss.", remedies: ["Apply Emamectin benzoate 5% SG", "Use Chlorantraniliprole 18.5% SC", "Release Trichogramma egg parasitoids"], preventive: ["Early planting", "Intercropping with legumes", "Pheromone traps for monitoring"] },
    ],
  },
  Soybean: {
    diseases: [
      { name: "Soybean Rust", severity: "High", description: "Phakopsora pachyrhizi causing tan to dark-brown lesions on leaves, leading to premature defoliation.", remedies: ["Apply Hexaconazole 5% EC", "Use Propiconazole spray", "Remove volunteer soybean plants"], preventive: ["Plant early-maturing varieties", "Avoid late sowing", "Monitor from flowering stage"] },
    ],
  },
  Groundnut: {
    diseases: [
      { name: "Tikka Disease (Leaf Spot)", severity: "Medium", description: "Cercospora causing circular brown spots on leaves, leading to defoliation and reduced pod filling.", remedies: ["Apply Carbendazim 50% WP @ 0.5g/L", "Spray Mancozeb at 10-day intervals", "Remove and destroy infected plant debris"], preventive: ["Use resistant varieties", "Seed treatment before sowing", "Maintain proper spacing"] },
    ],
  },
};


function tLocale(lang: string | undefined, templateId: string, vars: Record<string, any>) {
  if (lang === 'hi') {
    switch(templateId) {
      case 'High Humidity': return 'उच्च आर्द्रता';
      case 'Humidity': return 'आर्द्रता';
      case 'Temperature Stress': return 'तापमान तनाव';
      case 'Temperature': return 'तापमान';
      case 'Heavy Rainfall': return 'भारी वर्षा';
      case 'humid_exceed': return `${vars.hum}% सुरक्षित सीमा ${vars.thresh}% से अधिक है`;
      case 'humid_safe': return `${vars.hum}% सुरक्षित सीमा के भीतर है`;
      case 'temp_out': return `${vars.temp}°C अनुकूल श्रेणी (${vars.min}-${vars.max}°C) के बाहर है`;
      case 'temp_safe': return `${vars.temp}°C अनुकूल श्रेणी के भीतर है`;
      case 'rain_fungal': return `${vars.rain}mm फंगल रोगों के लिए स्थिति बनाता है`;
      case 'rec_low': return `आपकी ${vars.crop} की फसल अगले 7-10 दिनों के लिए स्वस्थ दिख रही है। नियमित निगरानी जारी रखें।`;
      case 'rec_med': return `${vars.crop} के लिए मध्यम बीमारी का जोखिम है। 3-4 दिनों के भीतर कवकनाशी स्प्रे करें।`;
      case 'rec_high': return `${vars.crop} के लिए उच्च बीमारी का जोखिम! तत्काल कार्रवाई करें।`;
      case 'cc_unsuited': return `${vars.crop} के लिए ${vars.season} के दौरान ${vars.region} की जलवायु अनुकूल नहीं है`;
      case 'cc_disease': return `${vars.crop} के लिए इस क्षेत्र में उच्च बीमारी का दबाव (${vars.risk}% जोखिम) है`;
      case 'cc_profit': return `${vars.crop} के लिए ${vars.region} में लाभ मार्जिन अत्यधिक अप्रत्याशित है`;
      case 'cc_well': return `${vars.season} के दौरान ${vars.region} की जलवायु के लिए अच्छी तरह से अनुकूलित`;
      case 'ir_no': return `मिट्टी की नमी ${vars.moist}% है जो ${vars.crop} के लिए पर्याप्त है। अभी सिंचाई की आवश्यकता नहीं है।`;
      case 'ir_light': return `मिट्टी थोड़ी सूखी है (${vars.moist}%)। प्रति एकड़ ${vars.water} लीटर हल्की सिंचाई की सिफारिश की जाती है।`;
      case 'ir_heavy': return `मिट्टी की नमी गम्भीर रूप से ${vars.moist}% पर कम है। प्रति एकड़ ${vars.water} लीटर तत्काल भारी सिंचाई आवश्यक है।`;
      case 'ir_action_no': return 'सिंचाई की आवश्यकता नहीं';
      case 'ir_action_light': return 'हल्की सिंचाई';
      case 'ir_action_full': return 'पूर्ण सिंचाई चक्र';
    }
  } else if (lang === 'or') {
    switch(templateId) {
      case 'High Humidity': return 'ଅଧିକ ଆର୍ଦ୍ରତା';
      case 'Humidity': return 'ଆର୍ଦ୍ରତା';
      case 'Temperature Stress': return 'ତାପମାତ୍ରା ଚାପ';
      case 'Temperature': return 'ତାପମାତ୍ରା';
      case 'Heavy Rainfall': return 'ପ୍ରବଳ ବର୍ଷା';
      case 'humid_exceed': return `${vars.hum}% ସୁରକ୍ଷିତ ସୀମା ${vars.thresh}% ରୁ ଅଧିକ`;
      case 'humid_safe': return `${vars.hum}% ସୁରକ୍ଷିତ ସୀମା ମଧ୍ୟରେ ଅଛି`;
      case 'temp_out': return `${vars.temp}°C ଅନୁକୂଳ ପରିସର (${vars.min}-${vars.max}°C) ବାହାରେ ଅଛି`;
      case 'temp_safe': return `${vars.temp}°C ଅନୁକୂଳ ପରିସର ମଧ୍ୟରେ ଅଛି`;
      case 'rain_fungal': return `${vars.rain}mm ଫଙ୍ଗାଲ୍ ରୋଗ ପାଇଁ ସ୍ଥିତି ସୃଷ୍ଟି କରେ`;
      case 'rec_low': return `ଆପଣଙ୍କର ${vars.crop} ଫସଲ ଆଗାମୀ 7-10 ଦିନ ପାଇଁ ସୁସ୍ଥ ଦେଖାଯାଉଛି। ନିୟମିତ ନୀରିକ୍ଷଣ ଜାରି ରଖନ୍ତୁ।`;
      case 'rec_med': return `${vars.crop} ପାଇଁ ମଧ୍ୟମ ରୋଗର ଆଶଙ୍କା। 3-4 ଦିନ ମଧ୍ୟରେ ଫଙ୍ଗିସାଇଡ୍ ସ୍ପ୍ରେ କରନ୍ତୁ।`;
      case 'rec_high': return `${vars.crop} ପାଇଁ ଉଚ୍ଚ ରୋଗର ଆଶଙ୍କା! ତୁରନ୍ତ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ ଗ୍ରହଣ କରନ୍ତୁ।`;
      case 'cc_unsuited': return `${vars.crop} କୁ ${vars.season} ସମୟରେ ${vars.region} ର ଜଳବାୟୁ ସୁଟ୍ କରେ ନାହିଁ`;
      case 'cc_disease': return `ଏହି ଅଞ୍ଚଳରେ ${vars.crop} ପାଇଁ ଅଧିକ ରୋଗ ଚାପ (${vars.risk}% ଆଶଙ୍କା) ଅଛି`;
      case 'cc_profit': return `${vars.region} ରେ ${vars.crop} ର ଲାଭ ମାର୍ଜିନ୍ ଅତ୍ୟନ୍ତ ଅନିଶ୍ଚିତ`;
      case 'cc_well': return `${vars.season} ଋତୁରେ ${vars.region} ର ଜଳବାୟୁ ପାଇଁ ଭଲ ଭାବରେ ଅନୁକୂଳ ଅଟେ`;
      case 'ir_no': return `ମୃତ୍ତିକା ଆର୍ଦ୍ରତା ${vars.moist}% ଯାହା ${vars.crop} ପାଇଁ ପର୍ଯ୍ୟାପ୍ତ ଅଟେ। ବର୍ତ୍ତମାନ ସିଞ୍ଚନର ଆବଶ୍ୟକତା ନାହିଁ।`;
      case 'ir_light': return `ମାଟି ଟିକିଏ ଶୁଖିଲା ଅଛି (${vars.moist}%)। ଏକର ପିଛା ${vars.water} ଲିଟର ହାଲୁକା ସିଞ୍ଚନ ପାଇଁ ସୁପାରିଶ କରାଯାଏ।`;
      case 'ir_heavy': return `ମୃତ୍ତିକା ଆର୍ଦ୍ରତା ଗମ୍ଭୀର ଭାବରେ ${vars.moist}% ରେ କମ୍ ଅଛି। ଏକର ପିଛା ${vars.water} ଲିଟର ତୁରନ୍ତ ଅଧିକ ସିଞ୍ଚନର ଆବଶ୍ୟକତା ଅଛି।`;
      case 'ir_action_no': return 'ସିଞ୍ଚନର ଆବଶ୍ୟକତା ନାହିଁ';
      case 'ir_action_light': return 'ହାଲୁକା ସିଞ୍ଚନ';
      case 'ir_action_full': return 'ସମ୍ପୂର୍ଣ୍ଣ ସିଞ୍ଚନ ଚକ୍ର';
    }
  }

  // English fallback
  switch(templateId) {
    case 'High Humidity': return 'High Humidity';
    case 'Humidity': return 'Humidity';
    case 'Temperature Stress': return 'Temperature Stress';
    case 'Temperature': return 'Temperature';
    case 'Heavy Rainfall': return 'Heavy Rainfall';
    case 'humid_exceed': return `${vars.hum}% exceeds safe threshold of ${vars.thresh}%`;
    case 'humid_safe': return `${vars.hum}% is within safe range`;
    case 'temp_out': return `${vars.temp}°C is outside optimal range (${vars.min}-${vars.max}°C)`;
    case 'temp_safe': return `${vars.temp}°C is within optimal range`;
    case 'rain_fungal': return `${vars.rain}mm creates conditions for fungal diseases`;
    case 'rec_low': return `Your ${vars.crop} crop appears healthy for the next 7-10 days. Continue regular monitoring and maintain current practices.`;
    case 'rec_med': return `Moderate disease risk detected for ${vars.crop}. Apply preventive fungicide spray within 3-4 days. Ensure proper drainage and avoid excess irrigation.`;
    case 'rec_high': return `High disease risk for ${vars.crop}! Immediate action needed: apply protective fungicide, improve field drainage, and scout daily for early symptoms.`;
    case 'cc_unsuited': return `${vars.crop} requires climate conditions not well-suited to ${vars.region} during ${vars.season} season`;
    case 'cc_disease': return `High disease pressure (${vars.risk}% risk) in this region for ${vars.crop}`;
    case 'cc_profit': return `Profit margins for ${vars.crop} are highly unpredictable in ${vars.region}`;
    case 'cc_well': return `Well-adapted to ${vars.region}'s climate with proven yield records during ${vars.season} season`;
    case 'ir_no': return `Soil moisture is ${vars.moist}% which is adequate for ${vars.crop}. No irrigation needed right now. Monitor again in 2-3 days.`;
    case 'ir_light': return `Soil is slightly dry at ${vars.moist}%. A light irrigation of ${vars.water} liters per acre is recommended. Use drip or sprinkler for best results.`;
    case 'ir_heavy': return `Soil moisture is critically low at ${vars.moist}%. Immediate heavy irrigation of ${vars.water} liters per acre needed. Start pump now to prevent crop stress.`;
    case 'ir_action_no': return 'No irrigation needed';
    case 'ir_action_light': return 'Light watering';
    case 'ir_action_full': return 'Full irrigation cycle';
  }
  return templateId;
}

export function simulateDiseaseDetection(cropType: string): DiseaseDetectionResult {
  const db = DISEASE_DB[cropType] || DISEASE_DB["Rice"];
  const seed = cropType + Date.now().toString().slice(-4);
  const idx = hash(seed) % db.diseases.length;
  const disease = db.diseases[idx];
  const confidence = 0.72 + seededRandom(seed, 1) * 0.23; // 72-95%

  return {
    diseaseName: disease.name,
    severity: disease.severity,
    confidence: Math.round(confidence * 100) / 100,
    description: disease.description,
    remedies: disease.remedies,
    preventiveMeasures: disease.preventive,
  };
}

// ─── Disease Risk Forecasting ───

const DISEASE_RISK_FACTORS: Record<string, { optimalTemp: [number, number]; humidityThreshold: number; rainfallSensitivity: number }> = {
  Rice: { optimalTemp: [25, 35], humidityThreshold: 80, rainfallSensitivity: 0.8 },
  Wheat: { optimalTemp: [10, 25], humidityThreshold: 70, rainfallSensitivity: 0.5 },
  Cotton: { optimalTemp: [25, 35], humidityThreshold: 65, rainfallSensitivity: 0.6 },
  Sugarcane: { optimalTemp: [20, 35], humidityThreshold: 75, rainfallSensitivity: 0.7 },
  Tomato: { optimalTemp: [18, 30], humidityThreshold: 75, rainfallSensitivity: 0.9 },
  Potato: { optimalTemp: [15, 25], humidityThreshold: 80, rainfallSensitivity: 0.85 },
  Onion: { optimalTemp: [15, 30], humidityThreshold: 70, rainfallSensitivity: 0.6 },
  Maize: { optimalTemp: [20, 32], humidityThreshold: 70, rainfallSensitivity: 0.5 },
  Soybean: { optimalTemp: [20, 30], humidityThreshold: 75, rainfallSensitivity: 0.7 },
  Groundnut: { optimalTemp: [25, 35], humidityThreshold: 65, rainfallSensitivity: 0.5 },
};

export function simulateDiseaseRisk(input: DiseaseRiskInput): DiseaseRiskResult {
  const factors = DISEASE_RISK_FACTORS[input.cropType] || DISEASE_RISK_FACTORS["Rice"];
  const seed = `${input.cropType}-${input.region}-${input.season}`;

  // Temperature risk
  let tempRisk = 0;
  if (input.temperature < factors.optimalTemp[0]) {
    tempRisk = (factors.optimalTemp[0] - input.temperature) * 3;
  } else if (input.temperature > factors.optimalTemp[1]) {
    tempRisk = (input.temperature - factors.optimalTemp[1]) * 4;
  }
  tempRisk = Math.min(tempRisk, 40);

  // Humidity risk
  const humidityRisk = input.humidity > factors.humidityThreshold
    ? (input.humidity - factors.humidityThreshold) * 1.5
    : 0;

  // Rainfall risk
  const rainfallRisk = Math.min(input.rainfall * factors.rainfallSensitivity * 0.3, 30);

  // Combined risk with some randomness
  let totalRisk = tempRisk + humidityRisk + rainfallRisk + seededRandom(seed) * 10;
  totalRisk = Math.min(Math.max(totalRisk, 5), 95);

  const riskLevel: "Low" | "Medium" | "High" = totalRisk < 30 ? "Low" : totalRisk < 60 ? "Medium" : "High";

  const db = DISEASE_DB[input.cropType] || DISEASE_DB["Rice"];
  const topDiseases = db.diseases.map((d, i) => ({
    name: d.name,
    probability: Math.round((totalRisk * (0.4 - i * 0.1) + seededRandom(seed, i + 10) * 15) * 10) / 10,
  })).filter(d => d.probability > 0).sort((a, b) => b.probability - a.probability);

  const factorsList: DiseaseRiskResult["factors"] = [];
  if (input.humidity > factors.humidityThreshold) {
    factorsList.push({ factor: tLocale(input.language, "High Humidity", {}), impact: "Negative", detail: tLocale(input.language, "humid_exceed", { hum: input.humidity, thresh: factors.humidityThreshold }) });
  } else {
    factorsList.push({ factor: tLocale(input.language, "Humidity", {}), impact: "Positive", detail: tLocale(input.language, "humid_safe", { hum: input.humidity }) });
  }
  if (input.temperature < factors.optimalTemp[0] || input.temperature > factors.optimalTemp[1]) {
    factorsList.push({ factor: tLocale(input.language, "Temperature Stress", {}), impact: "Negative", detail: tLocale(input.language, "temp_out", { temp: input.temperature, min: factors.optimalTemp[0], max: factors.optimalTemp[1] }) });
  } else {
    factorsList.push({ factor: tLocale(input.language, "Temperature", {}), impact: "Positive", detail: tLocale(input.language, "temp_safe", { temp: input.temperature }) });
  }
  if (input.rainfall > 20) {
    factorsList.push({ factor: tLocale(input.language, "Heavy Rainfall", {}), impact: "Negative", detail: tLocale(input.language, "rain_fungal", { rain: input.rainfall }) });
  }

  const recommendations: Record<string, string> = {
    Low: tLocale(input.language, "rec_low", { crop: input.cropType }),
    Medium: tLocale(input.language, "rec_med", { crop: input.cropType }),
    High: tLocale(input.language, "rec_high", { crop: input.cropType }),
  };

  return {
    riskPercentage: Math.round(totalRisk),
    riskLevel,
    topDiseases,
    factors: factorsList,
    recommendation: recommendations[riskLevel],
    forecastDays: 7 + Math.round(seededRandom(seed, 99) * 3),
  };
}

// ─── Yield & Profit Prediction ───

const CROP_ECONOMICS: Record<string, { yieldRange: [number, number]; unit: string; priceRange: [number, number]; baseCost: number }> = {
  Rice: { yieldRange: [18, 28], unit: "quintals", priceRange: [2100, 2800], baseCost: 22000 },
  Wheat: { yieldRange: [16, 24], unit: "quintals", priceRange: [2200, 2900], baseCost: 18000 },
  Cotton: { yieldRange: [6, 12], unit: "quintals", priceRange: [6200, 7500], baseCost: 28000 },
  Sugarcane: { yieldRange: [300, 450], unit: "quintals", priceRange: [315, 400], baseCost: 45000 },
  Tomato: { yieldRange: [80, 150], unit: "quintals", priceRange: [800, 2500], baseCost: 35000 },
  Potato: { yieldRange: [80, 120], unit: "quintals", priceRange: [600, 1500], baseCost: 30000 },
  Onion: { yieldRange: [60, 100], unit: "quintals", priceRange: [1000, 3500], baseCost: 32000 },
  Maize: { yieldRange: [20, 35], unit: "quintals", priceRange: [1900, 2400], baseCost: 16000 },
  Soybean: { yieldRange: [8, 14], unit: "quintals", priceRange: [4200, 5500], baseCost: 20000 },
  Groundnut: { yieldRange: [10, 18], unit: "quintals", priceRange: [5200, 6500], baseCost: 25000 },
};

export function simulateProfitPrediction(input: ProfitPredictionInput): ProfitPredictionResult {
  const econ = CROP_ECONOMICS[input.cropType] || CROP_ECONOMICS["Rice"];
  const seed = `${input.cropType}-${input.region}-${input.season}-${input.soilType}`;

  // Yield calculation
  const yieldFactor = seededRandom(seed, 1);
  const yieldPerAcre = econ.yieldRange[0] + yieldFactor * (econ.yieldRange[1] - econ.yieldRange[0]);

  // Irrigation bonus
  const irrigationMultiplier = input.irrigationType === "Drip" ? 1.15 : input.irrigationType === "Sprinkler" ? 1.08 : 1.0;
  const adjustedYield = Math.round(yieldPerAcre * irrigationMultiplier * 10) / 10;

  // Market price
  const priceFactor = seededRandom(seed, 2);
  const marketPrice = Math.round(econ.priceRange[0] + priceFactor * (econ.priceRange[1] - econ.priceRange[0]));
  const priceVariation = Math.round(marketPrice * 0.15);

  // Input costs
  const soilMultiplier = input.soilType === "Alluvial" ? 0.9 : input.soilType === "Black" ? 0.95 : input.soilType === "Red" ? 1.05 : 1.1;
  const inputCost = Math.round(econ.baseCost * soilMultiplier);

  const costBreakdown = [
    { item: "Seeds & Seedlings", cost: Math.round(inputCost * 0.12) },
    { item: "Fertilizers", cost: Math.round(inputCost * 0.22) },
    { item: "Pesticides & Fungicides", cost: Math.round(inputCost * 0.12) },
    { item: "Labour", cost: Math.round(inputCost * 0.28) },
    { item: "Irrigation", cost: Math.round(inputCost * 0.1) },
    { item: "Machinery & Equipment", cost: Math.round(inputCost * 0.1) },
    { item: "Transport & Misc", cost: Math.round(inputCost * 0.06) },
  ];

  const grossRevenue = Math.round(adjustedYield * marketPrice);
  const profit = grossRevenue - inputCost;
  const profitVariation = Math.round(Math.abs(profit) * 0.25);

  const riskFactors: string[] = [];
  if (input.season === "Kharif" && ["Tomato", "Potato"].includes(input.cropType)) {
    riskFactors.push("High rainfall during Kharif may cause waterlogging");
  }
  if (input.irrigationType === "Rain-fed") {
    riskFactors.push("Rain-fed cultivation adds weather dependency risk");
  }
  if (["Tomato", "Onion"].includes(input.cropType)) {
    riskFactors.push("High price volatility - market timing is critical");
  }

  return {
    expectedYieldPerAcre: adjustedYield,
    yieldUnit: econ.unit,
    expectedMarketPrice: marketPrice,
    marketPriceRange: { low: marketPrice - priceVariation, high: marketPrice + priceVariation },
    inputCostPerAcre: inputCost,
    costBreakdown,
    grossRevenuePerAcre: grossRevenue,
    profitPerAcre: profit,
    profitRange: { low: profit - profitVariation, high: profit + profitVariation },
    confidenceScore: Math.round((0.68 + seededRandom(seed, 5) * 0.2) * 100) / 100,
    riskFactors,
  };
}

// ─── Price Forecast & Sell/Store Decision ───

export function simulatePriceForecast(input: PriceForecastInput): PriceForecastResult {
  const seed = `${input.cropType}-${input.region}-price`;

  // Generate price timeline (30 days)
  const trend = seededRandom(seed, 1) > 0.4 ? 1 : -1;
  const volatility = ["Tomato", "Onion", "Potato"].includes(input.cropType) ? 0.04 : 0.015;

  const timeline: { day: number; price: number }[] = [];
  let price = input.currentPrice;
  for (let d = 0; d <= 30; d++) {
    timeline.push({ day: d, price: Math.round(price) });
    const change = (trend * 0.005 + (seededRandom(seed, d + 100) - 0.45) * volatility) * price;
    price += change;
  }

  // Best sell point
  let bestDay = 0;
  let bestPrice = timeline[0].price;
  for (const point of timeline) {
    if (point.price > bestPrice) {
      bestPrice = point.price;
      bestDay = point.day;
    }
  }

  const forecastedPrice = bestPrice;
  const totalStorageCost = bestDay * input.storageCostPerDay * input.quantityQuintals;
  const priceGain = (forecastedPrice - input.currentPrice) * input.quantityQuintals;
  const netGainLoss = priceGain - totalStorageCost;

  // Spoilage risk
  const perishable = ["Tomato", "Potato", "Onion"].includes(input.cropType);
  const spoilageRisk: "Low" | "Medium" | "High" = bestDay > 20 && perishable ? "High" : bestDay > 10 && perishable ? "Medium" : "Low";

  const priceTrend: "Rising" | "Stable" | "Falling" =
    timeline[30].price > input.currentPrice * 1.05 ? "Rising" :
    timeline[30].price < input.currentPrice * 0.95 ? "Falling" : "Stable";

  const shouldStore = netGainLoss > 0 && spoilageRisk !== "High" && bestDay >= 3;
  const decision: "Sell Now" | "Store" = shouldStore ? "Store" : "Sell Now";

  let reasoning: string;
  if (decision === "Store") {
    reasoning = `Prices for ${input.cropType} are expected to ${priceTrend.toLowerCase() === "rising" ? "rise" : "remain favorable"} over the next ${bestDay} days. Storing ${input.quantityQuintals} quintals could earn you an additional Rs ${Math.round(netGainLoss).toLocaleString("en-IN")} after storage costs. Spoilage risk is ${spoilageRisk.toLowerCase()}.`;
  } else {
    if (spoilageRisk === "High") {
      reasoning = `While prices may improve, the spoilage risk for ${input.cropType} over ${bestDay} days is too high. Selling now at Rs ${input.currentPrice}/quintal is the safer choice to avoid losses.`;
    } else if (priceTrend === "Falling") {
      reasoning = `Prices for ${input.cropType} are trending downward. Selling now at Rs ${input.currentPrice}/quintal avoids further price drops. Storage costs would exceed potential gains.`;
    } else {
      reasoning = `Current market conditions suggest selling ${input.cropType} now at Rs ${input.currentPrice}/quintal. The potential price improvement doesn't justify storage costs of Rs ${input.storageCostPerDay}/quintal/day.`;
    }
  }

  return {
    decision,
    storeDays: shouldStore ? bestDay : 0,
    currentPrice: input.currentPrice,
    forecastedPrice,
    priceChange: Math.round(((forecastedPrice - input.currentPrice) / input.currentPrice) * 100 * 10) / 10,
    expectedGainLoss: Math.round(netGainLoss),
    storageCost: Math.round(totalStorageCost),
    spoilageRisk,
    priceTrend,
    priceTimeline: timeline,
    reasoning,
  };
}

// ─── Risk Advisory (What NOT to Grow) ───

const REGION_CLIMATE: Record<string, { avgTemp: number; avgHumidity: number; rainfall: string; suitableCrops: string[] }> = {
  "Andhra Pradesh": { avgTemp: 29, avgHumidity: 72, rainfall: "moderate-high", suitableCrops: ["Rice", "Cotton", "Sugarcane", "Groundnut", "Maize"] },
  "Arunachal Pradesh": { avgTemp: 18, avgHumidity: 78, rainfall: "high", suitableCrops: ["Rice", "Maize", "Potato", "Soybean"] },
  Assam: { avgTemp: 25, avgHumidity: 82, rainfall: "high", suitableCrops: ["Rice", "Potato", "Sugarcane", "Maize"] },
  Bihar: { avgTemp: 27, avgHumidity: 68, rainfall: "moderate-high", suitableCrops: ["Rice", "Wheat", "Maize", "Sugarcane", "Potato"] },
  Chhattisgarh: { avgTemp: 27, avgHumidity: 62, rainfall: "moderate-high", suitableCrops: ["Rice", "Maize", "Soybean", "Groundnut", "Wheat"] },
  Goa: { avgTemp: 28, avgHumidity: 78, rainfall: "high", suitableCrops: ["Rice", "Sugarcane", "Groundnut", "Onion"] },
  Gujarat: { avgTemp: 28, avgHumidity: 55, rainfall: "low-moderate", suitableCrops: ["Cotton", "Groundnut", "Wheat", "Onion", "Sugarcane"] },
  Haryana: { avgTemp: 26, avgHumidity: 55, rainfall: "moderate", suitableCrops: ["Wheat", "Rice", "Cotton", "Sugarcane", "Maize"] },
  "Himachal Pradesh": { avgTemp: 16, avgHumidity: 60, rainfall: "moderate-high", suitableCrops: ["Wheat", "Maize", "Potato", "Rice", "Tomato"] },
  Jharkhand: { avgTemp: 26, avgHumidity: 65, rainfall: "moderate-high", suitableCrops: ["Rice", "Maize", "Wheat", "Potato", "Groundnut"] },
  Karnataka: { avgTemp: 27, avgHumidity: 70, rainfall: "moderate", suitableCrops: ["Rice", "Sugarcane", "Cotton", "Groundnut", "Maize"] },
  Kerala: { avgTemp: 28, avgHumidity: 82, rainfall: "high", suitableCrops: ["Rice", "Sugarcane", "Groundnut", "Tomato"] },
  "Madhya Pradesh": { avgTemp: 27, avgHumidity: 55, rainfall: "moderate", suitableCrops: ["Wheat", "Soybean", "Maize", "Cotton", "Groundnut"] },
  Maharashtra: { avgTemp: 28, avgHumidity: 65, rainfall: "moderate", suitableCrops: ["Cotton", "Sugarcane", "Soybean", "Onion", "Groundnut"] },
  Manipur: { avgTemp: 21, avgHumidity: 75, rainfall: "high", suitableCrops: ["Rice", "Maize", "Potato", "Soybean"] },
  Meghalaya: { avgTemp: 20, avgHumidity: 80, rainfall: "very-high", suitableCrops: ["Rice", "Maize", "Potato", "Soybean"] },
  Mizoram: { avgTemp: 22, avgHumidity: 76, rainfall: "high", suitableCrops: ["Rice", "Maize", "Sugarcane", "Potato"] },
  Nagaland: { avgTemp: 20, avgHumidity: 74, rainfall: "high", suitableCrops: ["Rice", "Maize", "Potato", "Soybean"] },
  Odisha: { avgTemp: 28, avgHumidity: 72, rainfall: "moderate-high", suitableCrops: ["Rice", "Groundnut", "Sugarcane", "Cotton", "Maize"] },
  Punjab: { avgTemp: 25, avgHumidity: 60, rainfall: "moderate", suitableCrops: ["Wheat", "Rice", "Cotton", "Sugarcane", "Maize"] },
  Rajasthan: { avgTemp: 30, avgHumidity: 40, rainfall: "low", suitableCrops: ["Wheat", "Groundnut", "Maize", "Cotton"] },
  Sikkim: { avgTemp: 15, avgHumidity: 78, rainfall: "high", suitableCrops: ["Rice", "Maize", "Potato", "Wheat"] },
  "Tamil Nadu": { avgTemp: 30, avgHumidity: 75, rainfall: "moderate-high", suitableCrops: ["Rice", "Sugarcane", "Groundnut", "Cotton", "Onion"] },
  Telangana: { avgTemp: 29, avgHumidity: 68, rainfall: "moderate", suitableCrops: ["Rice", "Cotton", "Maize", "Soybean", "Sugarcane"] },
  Tripura: { avgTemp: 26, avgHumidity: 80, rainfall: "high", suitableCrops: ["Rice", "Potato", "Sugarcane", "Maize"] },
  "Uttar Pradesh": { avgTemp: 26, avgHumidity: 65, rainfall: "moderate", suitableCrops: ["Wheat", "Rice", "Sugarcane", "Potato", "Maize"] },
  Uttarakhand: { avgTemp: 18, avgHumidity: 62, rainfall: "moderate-high", suitableCrops: ["Wheat", "Rice", "Potato", "Maize", "Soybean"] },
  "West Bengal": { avgTemp: 27, avgHumidity: 80, rainfall: "high", suitableCrops: ["Rice", "Potato", "Maize", "Sugarcane"] },
  Delhi: { avgTemp: 27, avgHumidity: 52, rainfall: "low-moderate", suitableCrops: ["Wheat", "Rice", "Tomato", "Onion", "Potato"] },
  "Jammu & Kashmir": { avgTemp: 14, avgHumidity: 58, rainfall: "moderate", suitableCrops: ["Rice", "Wheat", "Maize", "Potato", "Soybean"] },
};

const ALL_CROPS = ["Rice", "Wheat", "Cotton", "Sugarcane", "Tomato", "Potato", "Onion", "Maize", "Soybean", "Groundnut"];

export function simulateRiskAdvisory(input: RiskAdvisoryInput): RiskAdvisoryResult {
  const climate = REGION_CLIMATE[input.region] || REGION_CLIMATE["Punjab"];
  const seed = `${input.region}-${input.season}`;

  const unsuitableCrops = ALL_CROPS.filter(c => !climate.suitableCrops.includes(c));

  const cropsToAvoid = unsuitableCrops.map((crop) => {
    const cropSeed = `${seed}-${crop}`;
    const diseaseRisk = Math.round(40 + seededRandom(cropSeed, 1) * 45);
    const profitVolatility = Math.round(30 + seededRandom(cropSeed, 2) * 50);
    const climateMismatch = Math.round(50 + seededRandom(cropSeed, 3) * 40);
    const riskScore = Math.round((diseaseRisk * 0.3 + profitVolatility * 0.3 + climateMismatch * 0.4));

    const reasons: string[] = [];
    if (climateMismatch > 60) {
      reasons.push(tLocale(input.language, "cc_unsuited", { crop, region: input.region, season: input.season }));
    }
    if (diseaseRisk > 50) {
      reasons.push(tLocale(input.language, "cc_disease", { crop, risk: diseaseRisk }));
    }
    if (profitVolatility > 50) {
      reasons.push(tLocale(input.language, "cc_profit", { crop, region: input.region }));
    }
    if (input.season === "Kharif" && ["Wheat"].includes(crop)) {
      reasons.push(`${crop} is a Rabi crop - growing in Kharif will result in poor yields`);
    }
    if (input.season === "Rabi" && ["Rice"].includes(crop)) {
      reasons.push(`${crop} is primarily a Kharif crop - Rabi season is suboptimal`);
    }
    if (climate.rainfall === "low" && ["Rice", "Sugarcane"].includes(crop)) {
      reasons.push(`${crop} requires high water availability, which ${input.region} may not provide`);
    }

    if (reasons.length === 0) {
      reasons.push(`${crop} has limited historical success in ${input.region} during ${input.season} season`);
    }

    const riskLevel: "Low" | "Medium" | "High" | "Very High" =
      riskScore > 75 ? "Very High" : riskScore > 55 ? "High" : riskScore > 35 ? "Medium" : "Low";

    return { cropName: crop, riskScore, riskLevel, reasons, diseaseRisk, profitVolatility, climateMismatch };
  }).sort((a, b) => b.riskScore - a.riskScore);

  const safeCrops = climate.suitableCrops.slice(0, 4).map(name => ({
    name,
    reason: tLocale(input.language, "cc_well", { region: input.region, season: input.season }),
  }));

  const seasonInsights: Record<string, string> = {
    Kharif: `Kharif season in ${input.region} (June-October) brings monsoon rains. Focus on water-loving crops. Watch for fungal diseases due to high humidity.`,
    Rabi: `Rabi season in ${input.region} (October-March) offers cooler temperatures. Ideal for wheat, mustard, and cool-season vegetables. Lower disease pressure overall.`,
    Zaid: `Zaid season in ${input.region} (March-June) is hot and dry. Choose heat-tolerant, short-duration crops. Irrigation is critical during this period.`,
  };

  return {
    cropsToAvoid,
    safeCrops,
    seasonalInsight: seasonInsights[input.season] || seasonInsights["Kharif"],
  };
}

// ─── Smart Irrigation Advisor ───

const SOIL_WATER_RETENTION: Record<string, number> = {
  Alluvial: 0.72, Black: 0.85, Red: 0.55, Laterite: 0.48, Sandy: 0.30, Loamy: 0.68, Clay: 0.82,
};

const CROP_WATER_NEED: Record<string, number> = {
  Rice: 1200, Wheat: 450, Cotton: 700, Sugarcane: 1500, Tomato: 600, Potato: 500, Onion: 400, Maize: 550, Soybean: 500, Groundnut: 450,
};

export function simulateIrrigation(input: IrrigationInput): IrrigationResult {
  const seed = `${input.cropType}-${input.region}-${input.soilType}-${input.season}`;
  const retention = SOIL_WATER_RETENTION[input.soilType] || 0.6;
  const waterNeed = CROP_WATER_NEED[input.cropType] || 600;

  // Soil moisture prediction based on rainfall, humidity, temperature, soil retention
  let moisture = 30 + input.recentRainfall * retention * 1.2 + input.humidity * 0.25 - (input.temperature - 25) * 0.8;
  moisture += seededRandom(seed, 1) * 10 - 5;
  moisture = Math.min(Math.max(moisture, 8), 95);

  // Determine irrigation need
  const optimalMoisture = input.cropType === "Rice" ? 70 : 45;
  const deficit = optimalMoisture - moisture;

  let irrigationNeed: IrrigationResult["irrigationNeed"];
  let pumpStatus: "ON" | "OFF";
  let pumpDuration = 0;
  let waterRequired = 0;

  if (deficit <= 0) {
    irrigationNeed = "No Irrigation";
    pumpStatus = "OFF";
  } else if (deficit < 20) {
    irrigationNeed = "Light Irrigation";
    pumpStatus = "ON";
    pumpDuration = Math.round(15 + deficit * 2);
    waterRequired = Math.round(waterNeed * 0.3 * (deficit / 20));
  } else {
    irrigationNeed = "Heavy Irrigation";
    pumpStatus = "ON";
    pumpDuration = Math.round(30 + deficit * 3);
    waterRequired = Math.round(waterNeed * 0.6 * (deficit / 40));
  }

  // Water savings calculation (compared to flood irrigation)
  const floodWater = waterNeed * 0.8;
  const waterSaved = waterRequired > 0 ? Math.round(((floodWater - waterRequired) / floodWater) * 100) : 100;
  const costPerLiter = 0.05;
  const costSaving = Math.round((floodWater - waterRequired) * costPerLiter);

  // Over-irrigation score (0-100, higher = more risk of over-irrigating)
  const overIrrigationScore = moisture > optimalMoisture
    ? Math.min(Math.round((moisture - optimalMoisture) * 3), 100)
    : Math.max(0, 10 - deficit);

  const days = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  const schedule = days.map((day, i) => {
    const futureDeficit = deficit - i * 3 + seededRandom(seed, i + 20) * 8;
    if (futureDeficit <= 0) return { day, action: tLocale(input.language, "ir_action_no", {}), waterLiters: 0 };
    if (futureDeficit < 15) return { day, action: tLocale(input.language, "ir_action_light", {}), waterLiters: Math.round(waterRequired * 0.3) };
    return { day, action: tLocale(input.language, "ir_action_full", {}), waterLiters: Math.round(waterRequired * 0.7) };
  });

  const recommendations: Record<string, string> = {
    "No Irrigation": tLocale(input.language, "ir_no", { moist: Math.round(moisture), crop: input.cropType }),
    "Light Irrigation": tLocale(input.language, "ir_light", { moist: Math.round(moisture), water: waterRequired }),
    "Heavy Irrigation": tLocale(input.language, "ir_heavy", { moist: Math.round(moisture), water: waterRequired }),
  };

  return {
    soilMoisturePercent: Math.round(moisture),
    irrigationNeed,
    pumpStatus,
    pumpDurationMinutes: pumpDuration,
    waterRequired_liters: waterRequired,
    waterSaved_percent: Math.max(waterSaved, 0),
    costSaving_rs: Math.max(costSaving, 0),
    overIrrigationScore,
    recommendation: recommendations[irrigationNeed],
    schedule,
  };
}

// ─── Pest & Disease Outbreak Forecasting (Regional) ───

const REGIONAL_PESTS: Record<string, { pest: string; crops: string[]; humidityThreshold: number; tempRange: [number, number] }[]> = {
  default: [
    { pest: "Stem Borer", crops: ["Rice", "Sugarcane", "Maize"], humidityThreshold: 75, tempRange: [25, 35] },
    { pest: "Whitefly", crops: ["Cotton", "Tomato", "Onion"], humidityThreshold: 60, tempRange: [25, 38] },
    { pest: "Aphids", crops: ["Wheat", "Potato", "Tomato", "Onion"], humidityThreshold: 65, tempRange: [15, 28] },
    { pest: "Fall Armyworm", crops: ["Maize", "Rice", "Soybean"], humidityThreshold: 70, tempRange: [20, 35] },
    { pest: "Bollworm", crops: ["Cotton", "Tomato", "Groundnut"], humidityThreshold: 55, tempRange: [22, 34] },
    { pest: "Fruit Fly", crops: ["Tomato", "Onion"], humidityThreshold: 65, tempRange: [20, 32] },
    { pest: "Leaf Miner", crops: ["Tomato", "Potato", "Groundnut"], humidityThreshold: 60, tempRange: [18, 30] },
    { pest: "Pod Borer", crops: ["Soybean", "Groundnut"], humidityThreshold: 70, tempRange: [22, 32] },
  ],
};

const DISTRICT_MAP: Record<string, string[]> = {
  Punjab: ["Ludhiana", "Amritsar", "Patiala", "Jalandhar", "Bathinda"],
  Maharashtra: ["Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur"],
  Karnataka: ["Bangalore Rural", "Mysore", "Belgaum", "Dharwad", "Raichur"],
  "Tamil Nadu": ["Thanjavur", "Madurai", "Coimbatore", "Salem", "Tirunelveli"],
  "Uttar Pradesh": ["Lucknow", "Agra", "Varanasi", "Meerut", "Bareilly"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Sagar", "Rewa"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner"],
  Gujarat: ["Ahmedabad", "Surat", "Rajkot", "Vadodara", "Junagadh"],
  "Andhra Pradesh": ["Guntur", "Krishna", "East Godavari", "Kurnool", "Anantapur"],
  "West Bengal": ["Burdwan", "Hooghly", "Nadia", "Murshidabad", "Birbhum"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
  Haryana: ["Karnal", "Hisar", "Rohtak", "Ambala", "Sirsa"],
  Telangana: ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam"],
  Odisha: ["Cuttack", "Puri", "Ganjam", "Sambalpur", "Balasore"],
  Kerala: ["Palakkad", "Thrissur", "Ernakulam", "Alappuzha", "Wayanad"],
  Assam: ["Kamrup", "Nagaon", "Sonitpur", "Dibrugarh", "Jorhat"],
  Jharkhand: ["Ranchi", "Dhanbad", "Dumka", "Hazaribagh", "Deoghar"],
  Chhattisgarh: ["Raipur", "Durg", "Bilaspur", "Bastar", "Korba"],
  Uttarakhand: ["Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital", "Almora"],
  "Himachal Pradesh": ["Shimla", "Kangra", "Mandi", "Solan", "Una"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat", "Bomdila"],
  Goa: ["North Goa", "South Goa", "Panaji", "Margao", "Vasco"],
  Manipur: ["Imphal East", "Imphal West", "Thoubal", "Bishnupur", "Churachandpur"],
  Meghalaya: ["East Khasi Hills", "West Garo Hills", "Ri-Bhoi", "Jaintia Hills", "South Garo"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Mon", "Tuensang"],
  Sikkim: ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo"],
  Tripura: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Ambassa"],
  Delhi: ["Central Delhi", "South Delhi", "North Delhi", "East Delhi", "West Delhi"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
};

export function simulatePestOutbreak(input: PestOutbreakInput): PestOutbreakResult {
  const seed = `${input.region}-${input.season}-pest`;
  const pests = REGIONAL_PESTS.default;

  // Calculate outbreak probability based on weather
  let baseRisk = 20;
  if (input.humidity > 75) baseRisk += (input.humidity - 75) * 1.5;
  if (input.temperature > 30) baseRisk += (input.temperature - 30) * 2;
  if (input.recentRainfall > 25) baseRisk += input.recentRainfall * 0.5;
  baseRisk += seededRandom(seed, 1) * 15;
  const outbreakProbability = Math.min(Math.max(Math.round(baseRisk), 5), 95);

  const riskZone: PestOutbreakResult["riskZone"] =
    outbreakProbability < 35 ? "Low" : outbreakProbability < 65 ? "Moderate" : "High";

  // Affected crops based on pest suitability
  const affectedCrops = pests
    .filter(p => input.humidity >= p.humidityThreshold - 10 && input.temperature >= p.tempRange[0] && input.temperature <= p.tempRange[1] + 5)
    .flatMap(p => p.crops.map(crop => ({
      crop,
      riskPercent: Math.round(Math.min(outbreakProbability * (0.6 + seededRandom(`${seed}-${crop}-${p.pest}`, 2) * 0.5), 95)),
      pest: p.pest,
    })))
    .sort((a, b) => b.riskPercent - a.riskPercent)
    .slice(0, 8);

  // District-level alerts
  const districts = DISTRICT_MAP[input.region] || DISTRICT_MAP["Punjab"];
  const districtAlerts = districts.map((district, i) => {
    const distRisk = outbreakProbability + (seededRandom(`${seed}-${district}`, i) - 0.5) * 30;
    const level: "Low" | "Moderate" | "High" = distRisk < 35 ? "Low" : distRisk < 65 ? "Moderate" : "High";
    const pestIdx = Math.floor(seededRandom(`${seed}-${district}`, i + 10) * pests.length);
    return { district, level, pest: pests[pestIdx].pest };
  });

  const preventiveAdvisory: string[] = [];
  if (riskZone === "High") {
    preventiveAdvisory.push("Deploy pheromone traps immediately across all fields");
    preventiveAdvisory.push("Apply recommended bio-pesticides within 48 hours");
    preventiveAdvisory.push("Scout fields daily and report any unusual pest activity");
    preventiveAdvisory.push("Coordinate with neighboring farmers for area-wide management");
  } else if (riskZone === "Moderate") {
    preventiveAdvisory.push("Install yellow sticky traps for early detection");
    preventiveAdvisory.push("Monitor fields every 2-3 days for pest signs");
    preventiveAdvisory.push("Keep bio-pesticide stock ready for quick response");
  } else {
    preventiveAdvisory.push("Continue routine field monitoring weekly");
    preventiveAdvisory.push("Maintain field hygiene and remove crop residues");
    preventiveAdvisory.push("No immediate pest control action needed");
  }

  const historicalComparison = outbreakProbability > 60
    ? `Current conditions in ${input.region} are similar to the 2019 ${input.season} season outbreak when significant pest damage was reported. Early action is strongly advised.`
    : outbreakProbability > 35
    ? `Conditions are moderately similar to past outbreak years. Preventive monitoring is recommended for ${input.region}.`
    : `Current pest pressure in ${input.region} is below historical averages. Normal precautions are sufficient.`;

  return { outbreakProbability, riskZone, affectedCrops, districtAlerts, preventiveAdvisory, historicalComparison };
}

// ─── SMS Alert System ───

export function simulateSmsAlerts(input: SmsAlertInput): SmsAlertResult {
  const seed = `${input.cropType}-${input.region}-${input.season}-sms`;
  const phone = input.farmerPhone || "+91-XXXXX-XXXXX";
  const now = new Date();
  const alerts: SmsAlert[] = [];
  let id = 1;

  // Generate contextual alerts based on simulated conditions
  const riskVal = seededRandom(seed, 1);
  const profitVal = seededRandom(seed, 2);
  const priceVal = seededRandom(seed, 3);
  const moistureVal = seededRandom(seed, 4);

  // High disease risk alert
  if (riskVal > 0.4) {
    alerts.push({
      id: `sms-${id++}`,
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
      phone,
      message: `Alert: High disease risk for ${input.cropType} in ${input.region}. Spray fungicide within 3 days. Monitor leaves daily.`,
      triggerEvent: "High Disease Risk",
      priority: "Critical",
      delivered: true,
    });
  }

  // Soil moisture alert
  if (moistureVal < 0.5) {
    alerts.push({
      id: `sms-${id++}`,
      timestamp: new Date(now.getTime() - 7200000).toISOString(),
      phone,
      message: `${input.cropType}: Soil moisture low. Irrigate within 12 hrs. Use drip method to save water.`,
      triggerEvent: "Low Soil Moisture",
      priority: "High",
      delivered: true,
    });
  }

  // Price/sell alert
  if (priceVal > 0.5) {
    alerts.push({
      id: `sms-${id++}`,
      timestamp: new Date(now.getTime() - 14400000).toISOString(),
      phone,
      message: `${input.cropType} price rising in ${input.region}. Store 10 more days for better return. Current gain est: Rs 3,000+.`,
      triggerEvent: "Price Trend Change",
      priority: "Normal",
      delivered: true,
    });
  } else {
    alerts.push({
      id: `sms-${id++}`,
      timestamp: new Date(now.getTime() - 14400000).toISOString(),
      phone,
      message: `${input.cropType} price falling in ${input.region}. Sell soon to avoid loss. Don't store beyond 3 days.`,
      triggerEvent: "Price Drop Warning",
      priority: "High",
      delivered: true,
    });
  }

  // Profit volatility alert
  if (profitVal < 0.35) {
    alerts.push({
      id: `sms-${id++}`,
      timestamp: new Date(now.getTime() - 21600000).toISOString(),
      phone,
      message: `Advisory: Avoid growing ${input.cropType} next ${input.season} in ${input.region}. High loss risk. Try safer crops.`,
      triggerEvent: "Crop Avoidance Advisory",
      priority: "Critical",
      delivered: true,
    });
  }

  // Pest outbreak alert
  if (riskVal > 0.55) {
    alerts.push({
      id: `sms-${id++}`,
      timestamp: new Date(now.getTime() - 1800000).toISOString(),
      phone,
      message: `Pest alert in ${input.region}! Check ${input.cropType} fields for signs. Use neem spray. Report to agri officer.`,
      triggerEvent: "Pest Outbreak Warning",
      priority: "Critical",
      delivered: true,
    });
  }

  const criticalCount = alerts.filter(a => a.priority === "Critical").length;

  return {
    alerts: alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    totalSent: alerts.length,
    criticalCount,
    gateway: "Mock SMS Gateway (Simulated)",
  };
}

// ─── Farmer Chatbot (Rule-based + Context-aware) ───

const CHATBOT_KNOWLEDGE: { patterns: RegExp[]; getResponse: (crop: string, region: string, season: string) => string }[] = [
  {
    patterns: [/disease/i, /bimar/i, /rog/i, /infection/i, /leaf.*spot/i, /blight/i],
    getResponse: (crop, region, season) =>
      `Based on current ${season} season conditions in ${region}, ${crop} faces moderate disease risk. Common diseases include leaf blight and fungal infections. I recommend:\n\n1. Inspect leaves every 2-3 days\n2. Apply preventive fungicide if humidity > 80%\n3. Ensure proper field drainage\n4. Use disease-resistant seed varieties\n\nVisit the Disease Risk page for a detailed 7-10 day forecast.`,
  },
  {
    patterns: [/profit/i, /earn/i, /money/i, /income/i, /kamai/i, /munafa/i],
    getResponse: (crop, region, season) =>
      `For ${crop} in ${region} during ${season}:\n\nExpected yield: 18-25 quintals/acre\nCurrent market price: Rs 2,100-2,800/quintal\nEstimated input cost: Rs 18,000-25,000/acre\n\nYour estimated profit range: Rs 15,000 - Rs 45,000 per acre (depending on weather, input quality, and market timing).\n\nVisit the Profit Prediction page for exact calculations based on your soil and irrigation type.`,
  },
  {
    patterns: [/sell/i, /store/i, /bech/i, /rakh/i, /market/i, /price/i, /mandi/i],
    getResponse: (crop, region) =>
      `Current market analysis for ${crop} in ${region}:\n\nPrices are currently moderate. My recommendation depends on:\n- Storage facility availability\n- Spoilage risk for your crop\n- Current price trend direction\n\nGeneral advice: If you have good storage and low spoilage risk, waiting 7-10 days could give better prices.\n\nCheck the Sell/Store Decision page for a detailed price forecast with exact numbers.`,
  },
  {
    patterns: [/what.*grow/i, /kya.*ugau/i, /which.*crop/i, /suggest.*crop/i, /recommend/i],
    getResponse: (_crop, region, season) =>
      `For ${region} in ${season} season, here are my recommendations:\n\nSafe crops with good returns:\n- Rice (if water available)\n- Wheat (Rabi season)\n- Maize (versatile)\n\nCrops to be careful with:\n- Tomato (high price volatility)\n- Onion (unpredictable markets)\n\nVisit the Crop Advisory page to see which crops to specifically avoid in your region.`,
  },
  {
    patterns: [/water/i, /irrigat/i, /paani/i, /moisture/i, /pump/i, /sinchai/i],
    getResponse: (crop, region) =>
      `Irrigation advice for ${crop} in ${region}:\n\n${crop} typically needs 450-1200 liters per acre per cycle depending on soil type. Key tips:\n\n1. Check soil moisture before irrigating - avoid over-watering\n2. Drip irrigation saves 30-50% water vs flood irrigation\n3. Morning irrigation (6-8 AM) is most efficient\n4. After heavy rain, skip irrigation for 2-3 days\n\nVisit the Smart Irrigation page for real-time soil moisture prediction and pump control.`,
  },
  {
    patterns: [/pest/i, /keeda/i, /insect/i, /bug/i, /worm/i, /outbreak/i],
    getResponse: (crop, region, season) =>
      `Pest outlook for ${crop} in ${region} (${season}):\n\nCommon pests to watch:\n- Stem borers (in rice/sugarcane)\n- Whitefly (in cotton/tomato)\n- Aphids (in wheat/vegetables)\n\nPrevention tips:\n1. Use pheromone traps for early detection\n2. Neem-based sprays as first line of defense\n3. Maintain field hygiene\n4. Report unusual pest sightings to agriculture officer\n\nCheck the Pest Outbreak page for district-level risk forecasts.`,
  },
  {
    patterns: [/weather/i, /mausam/i, /rain/i, /barish/i, /temperature/i],
    getResponse: (_crop, region, season) =>
      `Weather impact on farming in ${region} during ${season}:\n\n${season === "Kharif" ? "Monsoon season brings heavy rain. Plan for drainage and watch for fungal diseases." : season === "Rabi" ? "Cool dry weather is favorable. Frost risk exists in northern regions." : "Hot dry conditions. Irrigation is critical. Avoid water-stress sensitive crops."}\n\nI use weather data (temperature, humidity, rainfall) to predict:\n- Disease risk\n- Soil moisture\n- Pest outbreak probability\n\nAll my predictions factor in current weather conditions.`,
  },
  {
    patterns: [/hello/i, /hi/i, /namaste/i, /help/i, /start/i],
    getResponse: (crop, region) =>
      `Namaste! I'm your CropIntel AI assistant. I can help you with:\n\n1. Disease risk for your crops\n2. Profit estimation per acre\n3. When to sell or store your harvest\n4. Which crops to avoid\n5. Irrigation and water management\n6. Pest outbreak alerts\n\nCurrently tracking: ${crop} in ${region}\n\nJust ask me anything about your farm!`,
  },
];

export function simulateChatbot(input: ChatbotInput): ChatbotResult {
  const crop = input.cropType || "Rice";
  const region = input.region || "Punjab";
  const season = input.season || "Kharif";
  const message = input.message.toLowerCase();

  // Match against knowledge base
  for (const entry of CHATBOT_KNOWLEDGE) {
    if (entry.patterns.some(p => p.test(message))) {
      return {
        reply: entry.getResponse(crop, region, season),
        suggestions: getSuggestions(message),
      };
    }
  }

  // Default response
  return {
    reply: `I understand you're asking about "${input.message}". Here's what I can help with for ${crop} in ${region}:\n\n1. Type "disease" for disease risk info\n2. Type "profit" for earning estimates\n3. Type "sell" for market advice\n4. Type "water" for irrigation guidance\n5. Type "pest" for pest alerts\n6. Type "what to grow" for crop recommendations\n\nTry asking a specific question and I'll give you detailed advice!`,
    suggestions: ["What diseases affect my crop?", "How much profit can I expect?", "Should I sell or store?", "Is pest risk high?"],
  };
}

function getSuggestions(message: string): string[] {
  if (/disease|blight|rog/i.test(message)) return ["What about pest risk?", "How much profit can I make?", "Should I spray now?"];
  if (/profit|earn|money/i.test(message)) return ["Should I sell or store?", "What crops give best profit?", "What are input costs?"];
  if (/sell|store|price/i.test(message)) return ["What's the disease risk?", "How much water does my crop need?", "What crops to avoid?"];
  if (/water|irrigat/i.test(message)) return ["What's the pest risk?", "Tell me about disease risk", "How much profit expected?"];
  return ["Tell me about disease risk", "How much profit per acre?", "Should I sell now?", "What crops to avoid?"];
}
