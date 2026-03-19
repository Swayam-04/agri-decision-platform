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

import { CROP_LIST, REGION_LIST, SEASON_LIST } from "./types";

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
  Pepper: {
    diseases: [
      { name: "Bacterial Wilt", severity: "High", description: "Soil-borne bacterial disease causing rapid wilting and death of the plant.", remedies: ["Remove and destroy infected plants", "Avoid waterlogging", "Use bleaching powder @ 15kg/ha"], preventive: ["Crop rotation with non-solanaceous crops", "Use resistant varieties", "Solarization of nursery beds"] },
      { name: "Powdery Mildew", severity: "Medium", description: "White powdery growth on leaves, leading to leaf fall and reduced yield.", remedies: ["Spray Sulfex @ 3g/L", "Apply Dinocap @ 1ml/L", "Remove infected plant parts"], preventive: ["Proper spacing for ventilation", "Avoid overhead irrigation", "Keep fields weed-free"] },
    ],
  },
};


function tLocale(lang: string | undefined, templateId: string, vars: Record<string, any>): string {
  const isHi = lang === 'hi';
  const isOr = lang === 'or';

  if (isHi) {
    switch(templateId) {
      // Chatbot specific
      case 'chat_disease': return `वर्तमान ${vars.season} के दौरान ${vars.region} में, ${vars.crop} के लिए ${vars.riskLevel} रोग जोखिम (${vars.risk}%) है। प्रमुख बीमारियाँ: ${vars.diseases}। सलाह: ${vars.rec}`;
      case 'chat_profit': return `${vars.season} (${vars.region}) में ${vars.crop} के लिए: प्रति एकड़ अनुमानित उपज ${vars.yield} ${vars.unit} है। संभावित शुद्ध लाभ: ${vars.profit} प्रति एकड़। बाजार भाव: ${vars.price}/क्विंटल।`;
      case 'chat_market': return `${vars.region} में ${vars.crop} के लिए बाजार सलाह: ${vars.decision}। ${vars.reason}`;
      case 'chat_water': return `${vars.region} में ${vars.crop} के लिए सिंचाई सलाह: ${vars.moist}% मिट्टी की नमी। ${vars.need}। सुझाव: ${vars.rec}`;
      case 'chat_pest': return `${vars.region} में ${vars.crop} के लिए कीट आउटलुक: ${vars.risk}। मुख्य कीट: ${vars.pests}। सलाह: ${vars.rec}`;
      case 'chat_weather': return `${vars.region} में ${vars.season} के दौरान कृषि पर मौसम का प्रभाव: ${vars.insight}`;
      case 'chat_advisory': return `${vars.region} में ${vars.season} के लिए फसल सलाह: सुरक्षित फसलें: ${vars.safe}। इनसे बचें: ${vars.avoid}।`;
      case 'chat_default': return `मैं "${vars.input}" के बारे में समझता हूँ। यहाँ बताया गया है कि मैं ${vars.crop} (${vars.region}) के लिए कैसे मदद कर सकता हूँ:\n\n1. बीमारी की जानकारी (रोग)\n2. लाभ अनुमान (मुनाफा)\n3. बाजार सलाह (बेचना/स्टोर)\n4. सिंचाई मार्गदर्शन (पानी)\n\nकृपया विशिष्ट प्रश्न पूछें!`;
      
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
      // Diseases
      case 'Rice Blast': return 'राइस ब्लास्ट';
      case 'Bacterial Leaf Blight': return 'बैक्टीरियल लीफ ब्लाइट';
      case 'Brown Spot': return 'ब्राउन स्पॉट';
      case 'Wheat Rust (Yellow)': return 'गेहूं का रतुआ (पीला)';
      case 'Powdery Mildew': return 'पाउडरी फफूंदी';
      case 'Early Blight': return 'अर्ली ब्लाइट';
      case 'Late Blight': return 'लेट ब्लाइट';
      case 'Leaf Curl Virus': return 'लीफ कर्ल वायरस';
      case 'Healthy': return 'स्वस्थ';
      case 'Healthy_desc': return `आपकी ${vars.crop} की फसल स्वस्थ और रोग मुक्त दिखाई देती है।`;
      case 'Healthy_prev1': return 'नियमित निगरानी जारी रखें';
      case 'Healthy_prev2': return 'संतुलित उर्वरीकरण और सिंचाई बनाए रखें';
      case 'Cotton Bollworm Damage': return 'कपास बॉलवर्म डैमेज';
      case 'Black Scurf': return 'ब्लैक स्कर्फ';
      case 'Red Rot': return 'रेड रॉट (लाल सड़न)';
      case 'Purple Blotch': return 'पर्पल ब्लॉच';
      case 'Fall Armyworm': return 'फॉल आर्मीवर्म';
      case 'Soybean Rust': return 'सोयाबीन रस्ट';
      case 'Tikka Disease (Leaf Spot)': return 'टिक्का रोग (लीफ स्पॉट)';
      // Cost Breakdown
      case 'Seeds & Seedlings': return 'बीज और पौधे';
      case 'Fertilizers': return 'उर्वरक';
      case 'Pesticides & Fungicides': return 'कीटनाशक और कवकनाशी';
      case 'Labour': return 'श्रम';
      case 'Irrigation': return 'सिंचाई';
      case 'Machinery & Equipment': return 'मशीनरी और उपकरण';
      case 'Transport & Misc': return 'परिवहन और अन्य';
      // Crops
      case 'Rice': return 'चावल';
      case 'Wheat': return 'गेहूँ';
      case 'Maize': return 'मक्का';
      case 'Cotton': return 'कपास';
      case 'Sugarcane': return 'गन्ना';
      case 'Soybean': return 'सोयाबीन';
      case 'Groundnut': return 'मूंगफली';
      case 'Tomato': return 'टमाटर';
      case 'Potato': return 'आलू';
      case 'Onion': return 'प्याज';
      case 'Pepper': return 'काली मिर्च';
      // Regions
      case 'Punjab': return 'पंजाब';
      case 'Haryana': return 'हरियाणा';
      case 'Uttar Pradesh': return 'उत्तर प्रदेश';
      case 'Madhya Pradesh': return 'मध्य प्रदेश';
      case 'Rajasthan': return 'राजस्थान';
      case 'Maharashtra': return 'महाराष्ट्र';
      case 'Gujarat': return 'गुजरात';
      case 'Karnataka': return 'कर्नाटक';
      case 'Andhra Pradesh': return 'आंध्र प्रदेश';
      case 'Telangana': return 'तेलंगाना';
      case 'Tamil Nadu': return 'तमिलनाडु';
      case 'West Bengal': return 'पश्चिम बंगाल';
      case 'Bihar': return 'बिहार';
      case 'Odisha': return 'ओडिशा';
      // Seasons
      case 'Kharif': return 'खरीफ';
      case 'Rabi': return 'रबी';
      case 'Zaid': return 'ज़ैद';
      // Units
      case 'quintals/acre': return 'क्विंटल/एकड़';
      case 'Rs/quintal': return 'रु/क्विंटल';
      case 'Rs/acre': return 'रु/एकड़';
      // States
      case 'Punjab': return 'पंजाब';
      case 'Maharashtra': return 'महाराष्ट्र';
      case 'Karnataka': return 'कर्नाटक';
      case 'Tamil Nadu': return 'तमिलनाडु';
      case 'Uttar Pradesh': return 'उत्तर प्रदेश';
      case 'Madhya Pradesh': return 'मध्य प्रदेश';
      case 'Rajasthan': return 'राजस्थान';
      case 'Gujarat': return 'गुजरात';
      case 'Andhra Pradesh': return 'आंध्र प्रदेश';
      case 'West Bengal': return 'पश्चिम बंगाल';
      case 'Bihar': return 'बिहार';
      case 'Haryana': return 'हरियाणा';
      case 'Telangana': return 'तेलंगाना';
      case 'Odisha': return 'ओडिशा';
      case 'Kerala': return 'केरल';
      case 'Assam': return 'असम';
      case 'Jharkhand': return 'झारखंड';
      case 'Chhattisgarh': return 'छत्तीसगढ़';
      case 'Uttarakhand': return 'उत्तराखंड';
      case 'Himachal Pradesh': return 'हिमाचल प्रदेश';
      case 'Jammu & Kashmir': return 'जम्मू और कश्मीर';
      // Districts (Sample)
      case 'Ludhiana': return 'लुधियाना';
      case 'Amritsar': return 'अमृतसर';
      case 'Patiala': return 'पटियाला';
      case 'Jalandhar': return 'जालंधर';
      case 'Bathinda': return 'बठिंडा';
      case 'Pune': return 'पुणे';
      case 'Nagpur': return 'नागपुर';
      case 'Nashik': return 'नाशिक';
      case 'Bangalore Rural': return 'बैंगलोर ग्रामीण';
      case 'Mysore': return 'मैसूर';
      case 'Lucknow': return 'लखनऊ';
      case 'Varanasi': return 'वाराणसी';
      case 'Indore': return 'इंदौर';
      case 'Jaipur': return 'जयपुर';
      case 'Ahmedabad': return 'अहमदाबाद';
      case 'Cuttack': return 'कटक';
      case 'Puri': return 'पुरी';
      case 'Sambalpur': return 'संबलपुर';
      case 'Ganjam': return 'गंजम';
      case 'Balasore': return 'बालासोर';
      case 'Nagpur': return 'नागपुर';
      case 'Nashik': return 'नाशिक';
      case 'Aurangabad': return 'औरंगाबाद';
      case 'Kolhapur': return 'कोल्हापुर';
      case 'Belgaum': return 'बेलगाम';
      case 'Dharwad': return 'धारवाड़';
      case 'Raichur': return 'रायचूर';
      case 'Thanjavur': return 'तंजावुर';
      case 'Madurai': return 'मदुरै';
      case 'Coimbatore': return 'कोयंबटूर';
      case 'Salem': return 'सेलम';
      case 'Tirunelveli': return 'तिरुनेलवेली';
      case 'Agra': return 'आगरा';
      case 'Meerut': return 'मेरठ';
      case 'Bareilly': return 'बरेली';
      case 'Bhopal': return 'भोपाल';
      case 'Jabalpur': return 'जबलपुर';
      case 'Sagar': return 'सागर';
      case 'Rewa': return 'रीवा';
      case 'Jodhpur': return 'जोधपुर';
      case 'Udaipur': return 'उदयपुर';
      case 'Kota': return 'कोटा';
      case 'Bikaner': return 'बीकानेर';
      case 'Surat': return 'सूरत';
      case 'Rajkot': return 'राजकोट';
      case 'Vadodara': return 'वडोदरा';
      case 'Junagadh': return 'जूनागढ़';
      case 'Guntur': return 'गुंटूर';
      case 'Krishna': return 'कृष्णा';
      case 'East Godavari': return 'पूर्वी गोदावरी';
      case 'Kurnool': return 'कुरनूल';
      case 'Anantapur': return 'अनंतपुर';
      case 'Burdwan': return 'बर्धमान';
      case 'Hooghly': return 'हुगली';
      case 'Nadia': return 'नदिया';
      case 'Murshidabad': return 'मुर्शिदाबाद';
      case 'Birbhum': return 'बीरभूम';
      case 'Patna': return 'पटना';
      case 'Gaya': return 'गया';
      case 'Muzaffarpur': return 'मुजफ्फरपुर';
      case 'Bhagalpur': return 'भागलपुर';
      case 'Darbhanga': return 'दरभंगा';
      case 'Karnal': return 'करनाल';
      case 'Hisar': return 'हिसार';
      case 'Rohtak': return 'रोहतक';
      case 'Ambala': return 'अंबाला';
      case 'Sirsa': return 'सिरसा';
      case 'Hyderabad': return 'हैदराबाद';
      case 'Warangal': return 'वरंगल';
      case 'Karimnagar': return 'करीमनगर';
      case 'Nizamabad': return 'निजामाबाद';
      case 'Khammam': return 'खम्मम';
      case 'Palakkad': return 'पलक्कड़';
      case 'Thrissur': return 'त्रिशूर';
      case 'Ernakulam': return 'एर्नाकुलम';
      case 'Alappuzha': return 'अलाप्पुझा';
      case 'Wayanad': return 'वायनाड';
      case 'Kamrup': return 'कामरूप';
      case 'Nagaon': return 'नगांव';
      case 'Sonitpur': return 'सोनितपुर';
      case 'Dibrugarh': return 'डिब्रूगढ़';
      case 'Jorhat': return 'जोरहाट';
      case 'Ranchi': return 'रांची';
      case 'Dhanbad': return 'धनबाद';
      case 'Dumka': return 'दुमका';
      case 'Hazaribagh': return 'हजारीबाग';
      case 'Deoghar': return 'देवघर';
      case 'Raipur': return 'रायपुर';
      case 'Durg': return 'दुर्ग';
      case 'Bilaspur': return 'बिलासपुर';
      case 'Bastar': return 'बस्तर';
      case 'Korba': return 'कोरबा';
      case 'Dehradun': return 'देहरादून';
      case 'Haridwar': return 'हरिद्वार';
      case 'Udham Singh Nagar': return 'ऊधम सिंह नगर';
      case 'Nainital': return 'नैनीताल';
      case 'Almora': return 'अल्मोड़ा';
      case 'Shimla': return 'शिमला';
      case 'Kangra': return 'कांगड़ा';
      case 'Mandi': return 'मंडी';
      case 'Solan': return 'सोलन';
      case 'Una': return 'ऊना';
      case 'Itanagar': return 'ईटानगर';
      case 'Tawang': return 'तवांग';
      case 'Ziro': return 'जीरो';
      case 'Pasighat': return 'पासीघाट';
      case 'Bomdila': return 'बोमडिला';
      case 'North Goa': return 'उत्तरी गोवा';
      case 'South Goa': return 'दक्षिणी गोवा';
      case 'Panaji': return 'पणजी';
      case 'Margao': return 'मडगांव';
      case 'Vasco': return 'वास्को';
      case 'Imphal East': return 'इम्फाल पूर्व';
      case 'Imphal West': return 'इम्फाल पश्चिम';
      case 'Thoubal': return 'थौबल';
      case 'Bishnupur': return 'बिष्णुपुर';
      case 'Churachandpur': return 'चुराचांदपुर';
      case 'East Khasi Hills': return 'पूर्वी खासी हिल्स';
      case 'West Garo Hills': return 'पश्चिमी गारो हिल्स';
      case 'Ri-Bhoi': return 'री-भोई';
      case 'Jaintia Hills': return 'जयंतिया हिल्स';
      case 'South Garo': return 'दक्षिणी गारो';
      case 'Aizawl': return 'आइजोल';
      case 'Lunglei': return 'लुंगलेई';
      case 'Champhai': return 'चंफाई';
      case 'Kolasib': return 'कोलासिब';
      case 'Serchhip': return 'सेरछिप';
      case 'Kohima': return 'कोहिमा';
      case 'Dimapur': return 'दीमापुर';
      case 'Mokokchung': return 'मोकोकचुंग';
      case 'Mon': return 'मोन';
      case 'Tuensang': return 'त्यूएनसांग';
      case 'Gangtok': return 'गंगटोक';
      case 'Namchi': return 'नामची';
      case 'Mangan': return 'मंगन';
      case 'Gyalshing': return 'ग्यालशिंग';
      case 'Rangpo': return 'रंगपो';
      case 'Agartala': return 'अगरतला';
      case 'Dharmanagar': return 'धर्मनगर';
      case 'Kailashahar': return 'कैलाशहर';
      case 'Ambassa': return 'अंबासा';
      case 'Central Delhi': return 'मध्य दिल्ली';
      case 'South Delhi': return 'दक्षिण दिल्ली';
      case 'North Delhi': return 'उत्तर दिल्ली';
      case 'East Delhi': return 'पूर्वी दिल्ली';
      case 'West Delhi': return 'पश्चिम दिल्ली';
      case 'Srinagar': return 'श्रीनगर';
      case 'Jammu': return 'जम्मू';
      case 'Anantnag': return 'अनंतनाग';
      case 'Baramulla': return 'बारामूला';
      case 'Udhampur': return 'ऊधमपुर';
      // SMS
      case 'sms_moisture': return `${vars.crop}: मिट्टी की नमी कम है। 12 घंटे के भीतर सिंचाई करें। पानी बचाने के लिए ड्रिप विधि का उपयोग करें।`;
      case 'sms_price_up': return `${vars.region} में ${vars.crop} की कीमतें बढ़ रही हैं। बेहतर रिटर्न के लिए 10 दिन और स्टोर करें। अनुमानित लाभ: रु 3,000+।`;
      case 'sms_price_down': return `${vars.region} में ${vars.crop} की कीमतें गिर रही हैं। नुकसान से बचने के लिए जल्द ही बेचें। 3 दिन से ज्यादा स्टोर न करें।`;
      case 'sms_profit_vol': return `सलाह: अगले ${vars.season} के दौरान ${vars.region} में ${vars.crop} उगाने से बचें। भारी नुकसान का जोखिम। सुरक्षित फसलें आजमाएं।`;
      case 'sms_pest': return `${vars.region} में कीट अलर्ट! संकेतों के लिए ${vars.crop} के खेतों की जाँच करें। नीम स्प्रे का प्रयोग करें। कृषि अधिकारी को सूचित करें।`;
      case 'sms_disease_risk': return `अलर्ट: ${vars.region} में ${vars.crop} के लिए उच्च रोग जोखिम। 3 दिनों के भीतर कवकनाशी स्प्रे करें। रोजाना पत्तियों की निगरानी करें।`;
      case 'Medium': return 'मध्यम';
      // Pests
      case 'Stem Borer': return 'तना छेदक (स्टेम बोरर)';
      case 'Whitefly': return 'सफेद मक्खी (वाइटफ्लाई)';
      case 'Aphids': return 'माहू (एफिड्स)';
      case 'Fall Armyworm': return 'फॉल आर्मीवर्म';
      case 'Bollworm': return 'बॉलवर्म';
      case 'Fruit Fly': return 'फल मक्खी';
      case 'Leaf Miner': return 'लीफ माइनर';
      case 'Pod Borer': return 'फली छेदक (पॉड बोरर)';
      // Levels
      case 'Low': return 'कम';
      case 'Moderate': return 'मध्यम';
      case 'High': return 'उच्च';
      default: return templateId;
    }
  } else if (isOr) {
    switch(templateId) {
      // Chatbot specific
      case 'chat_disease': return `ବର୍ତ୍ତମାନର ${vars.season} ସମୟରେ ${vars.region} ରେ, ${vars.crop} ପାଇଁ ${vars.riskLevel} ରୋଗ ଆଶଙ୍କା (${vars.risk}%) ଅଛି | ମୁଖ୍ୟ ରୋଗ: ${vars.diseases} | ପରାମର୍ଶ: ${vars.rec}`;
      case 'chat_profit': return `${vars.season} (${vars.region}) ରେ ${vars.crop} ପାଇଁ: ଏକର ପିଛା ଆନୁମାନିକ ଅମଳ ${vars.yield} ${vars.unit} ଅଟେ | ସମ୍ଭାବ୍ୟ ନିଟ୍ ଲାଭ: ଏକର ପିଛା ${vars.profit} | ବଜାର ଦର: ${vars.price}/କ୍ୱିଣ୍ଟାଲ୍ |`;
      case 'chat_market': return `${vars.region} ରେ ${vars.crop} ପାଇଁ ବଜାର ପରାମର୍ଶ: ${vars.decision} | ${vars.reason}`;
      case 'chat_water': return `${vars.region} ରେ ${vars.crop} ପାଇଁ ଜଳସେଚନ ପରାମର୍ଶ: ${vars.moist}% ମୃତ୍ତିକା ଆର୍ଦ୍ରତା | ${vars.need} | ପରାମର୍ଶ: ${vars.rec}`;
      case 'chat_pest': return `${vars.region} ରେ ${vars.crop} ପାଇଁ କୀଟ ଆଉଟଲୁକ୍: ${vars.risk} | ମୁଖ୍ୟ କୀଟ: ${vars.pests} | ପରାମର୍ଶ: ${vars.rec}`;
      case 'chat_weather': return `${vars.region} ରେ ${vars.season} ସମୟରେ କୃଷି ଉପରେ ପାଣିପାଗର ପ୍ରଭାବ: ${vars.insight}`;
      case 'chat_advisory': return `${vars.region} ରେ ${vars.season} ପାଇଁ ଫସଲ ପରାମର୍ଶ: ସୁରକ୍ଷିତ ଫସଲ: ${vars.safe} | ଏହି ସବୁଠାରୁ ଦୂରେଇ ରୁହନ୍ତୁ: ${vars.avoid} |`;
      case 'chat_default': return `ମୁଁ "${vars.input}" ବିଷୟରେ ବୁଝୁଛି | ଏଠାରେ ${vars.crop} (${vars.region}) ପାଇଁ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି ସେ ବିଷୟରେ ଦିଆଯାଇଛି:\n\n1. ରୋଗ ସୂଚନା (ରୋଗ)\n2. ଲାଭ ଆକଳନ (ଲାଭ)\n3. ବଜାର ପରାମର୍ଶ (ବିକ୍ରି/ସଂରକ୍ଷଣ)\n4. ଜଳସେଚନ ମାର୍ଗଦର୍ଶନ (ପାଣି)\n\nଦୟାକରି ନିର୍ଦ୍ଦିଷ୍ଟ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ!`;

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
      // Diseases
      case 'Rice Blast': return 'ରାଇସ୍ ବ୍ଲାଷ୍ଟ୍ (ଧାନ ବ୍ଲାଷ୍ଟ୍)';
      case 'Bacterial Leaf Blight': return 'ବ୍ୟାକ୍ଟେରିଆଲ୍ ଲିଫ୍ ବ୍ଲାଇଟ୍';
      case 'Brown Spot': return 'ବ୍ରାଉନ୍ ସ୍ପଟ୍ (ବାଦାମୀ ଦାଗ)';
      case 'Wheat Rust (Yellow)': return 'ଗହମ କଳଙ୍କି (ହଳଦିଆ)';
      case 'Powdery Mildew': return 'ପାଉଡରୀ ମିଲଡ୍ୟୁ';
      case 'Early Blight': return 'ପ୍ରାରମ୍ଭିକ ବ୍ଲାଇଟ୍ (ଅର୍ଲି ବ୍ଲାଇଟ୍)';
      case 'Late Blight': return 'ବିଳମ୍ବିତ ବ୍ଲାଇଟ୍ (ଲେଟ୍ ବ୍ଲାଇଟ୍)';
      case 'Leaf Curl Virus': return 'ଲିଫ୍ କର୍ଲ ଭାଇରସ୍ (ପତ୍ର ମୋଡ଼ା)';
      case 'Healthy': return 'ସୁସ୍ଥ';
      case 'Healthy_desc': return `ଆପଣଙ୍କର ${vars.crop} ଫସଲ ସୁସ୍ଥ ଏବଂ ରୋଗମୁକ୍ତ ଦେଖାଯାଉଛି |`;
      case 'Healthy_prev1': return 'ନିୟମିତ ନୀରିକ୍ଷଣ ଜାରି ରଖନ୍ତୁ';
      case 'Healthy_prev2': return 'ସନ୍ତୁଳିତ ସାର ଏବଂ ଜଳସେଚନ ବଜାୟ ରଖନ୍ତୁ';
      case 'Cotton Bollworm Damage': return 'କପା ବୋଲୱର୍ମ କ୍ଷତି';
      case 'Black Scurf': return 'ବ୍ଲାକ୍ ସ୍କର୍ଫ୍';
      case 'Red Rot': return 'ରେଡ୍ ରଟ୍ (ଲାଲ୍ ସଢ଼ା)';
      case 'Purple Blotch': return 'ପର୍ପଲ୍ ବ୍ଲଚ୍ (ବାଇଗଣୀ ଦାଗ)';
      case 'Fall Armyworm': return 'ଫଲ୍ ଆର୍ମିୱର୍ମ';
      case 'Soybean Rust': return 'ସୋୟାବିନ୍ ରଷ୍ଟ୍';
      case 'Tikka Disease (Leaf Spot)': return 'ଟିକ୍କା ରୋଗ (ପତ୍ର ଦାଗ)';
      // Cost Breakdown
      case 'Seeds & Seedlings': return 'ବିହନ ଏବଂ ଚାରା';
      case 'Fertilizers': return 'ସାର';
      case 'Pesticides & Fungicides': return 'କୀଟନାଶକ ଏବଂ କବକନାଶକ';
      case 'Labour': return 'ଶ୍ରମିକ';
      case 'Irrigation': return 'ଜଳସେଚନ';
      case 'Machinery & Equipment': return 'ଯନ୍ତ୍ରପାତି ଏବଂ ଉପକରଣ';
      case 'Transport & Misc': return 'ପରିବହନ ଏବଂ ଅନ୍ୟାନ୍ୟ';
      // Crops
      case 'Rice': return 'ଧାନ';
      case 'Wheat': return 'ଗହମ';
      case 'Maize': return 'ମକ୍କା';
      case 'Cotton': return 'କପା';
      case 'Sugarcane': return 'ଆଖୁ';
      case 'Soybean': return 'ସୋୟାବିନ୍';
      case 'Groundnut': return 'ଚିନାବାଦାମ';
      case 'Tomato': return 'ଟମାଟୋ';
      case 'Potato': return 'ଆଳୁ';
      case 'Onion': return 'ପିଆଜ';
      case 'Pepper': return 'ଗୋଲମରିଚ';
      // Regions
      case 'Punjab': return 'ପଞ୍ଜାବ';
      case 'Haryana': return 'ହରିୟାଣା';
      case 'Uttar Pradesh': return 'ଉତ୍ତର ପ୍ରଦେଶ';
      case 'Madhya Pradesh': return 'ମଧ୍ୟ ପ୍ରଦେଶ';
      case 'Rajasthan': return 'ରାଜସ୍ଥାନ';
      case 'Maharashtra': return 'ମହାରାଷ୍ଟ୍ର';
      case 'Gujarat': return 'ଗୁଜୁରାଟ';
      case 'Karnataka': return 'କର୍ଣ୍ଣାଟକ';
      case 'Andhra Pradesh': return 'ଆନ୍ଧ୍ର ପ୍ରଦେଶ';
      case 'Telangana': return 'ତେଲେଙ୍ଗାନା';
      case 'Tamil Nadu': return 'ତାମିଲନାଡୁ';
      case 'West Bengal': return 'ପଶ୍ଚିମ ବଙ୍ଗ';
      case 'Bihar': return 'ବିହାର';
      case 'Odisha': return 'ଓଡ଼ିଶା';
      // Seasons
      case 'Kharif': return 'ଖରିଫ୍';
      case 'Rabi': return 'ରବି';
      case 'Zaid': return 'ଜୈଦ୍';
      // Units
      case 'quintals/acre': return 'କ୍ୱିଣ୍ଟାଲ୍/ଏକର';
      case 'Rs/quintal': return 'ଟଙ୍କା/କ୍ୱିଣ୍ଟାଲ୍';
      case 'Rs/acre': return 'ଟଙ୍କା/ଏକର';
      // States
      case 'Punjab': return 'ପଞ୍ଜାବ';
      case 'Maharashtra': return 'ମହାରାଷ୍ଟ୍ର';
      case 'Karnataka': return 'କର୍ଣ୍ଣାଟକ';
      case 'Tamil Nadu': return 'ତାମିଲନାଡୁ';
      case 'Uttar Pradesh': return 'ଉତ୍ତର ପ୍ରଦେଶ';
      case 'Madhya Pradesh': return 'ମଧ୍ୟ ପ୍ରଦେଶ';
      case 'Rajasthan': return 'ରାଜସ୍ଥାନ';
      case 'Gujarat': return 'ଗୁଜୁରାଟ';
      case 'Andhra Pradesh': return 'ଆନ୍ଧ୍ର ପ୍ରଦେଶ';
      case 'West Bengal': return 'ପଶ୍ଚିମ ବଙ୍ଗ';
      case 'Bihar': return 'ବିହାର';
      case 'Haryana': return 'ହରିୟାଣା';
      case 'Telangana': return 'ତେଲେଙ୍ଗାନା';
      case 'Odisha': return 'ଓଡ଼ିଶା';
      case 'Kerala': return 'କେରଳ';
      case 'Assam': return 'ଆସାମ';
      case 'Jharkhand': return 'ଝାଡ଼ଖଣ୍ଡ';
      case 'Chhattisgarh': return 'ଛତିଶଗଡ଼';
      case 'Uttarakhand': return 'ଉତ୍ତରାଖଣ୍ଡ';
      case 'Himachal Pradesh': return 'ହିମାଚଳ ପ୍ରଦେଶ';
      case 'Jammu & Kashmir': return 'ଜାମ୍ମୁ ଓ କାଶ୍ମୀର';
      // Districts
      case 'Ludhiana': return 'ଲୁଧିଆନା';
      case 'Amritsar': return 'ଅମୃତସର';
      case 'Patiala': return 'ପଟିଆଲା';
      case 'Jalandhar': return 'ଜଲନ୍ଧର';
      case 'Bathinda': return 'ବଟିଣ୍ଡା';
      case 'Pune': return 'ପୁଣେ';
      case 'Nagpur': return 'ନାଗପୁର';
      case 'Nashik': return 'ନାଶିକ୍';
      case 'Bangalore Rural': return 'ବାଙ୍ଗାଲୋର ଗ୍ରାମୀଣ';
      case 'Mysore': return 'ମୈସୁର';
      case 'Lucknow': return 'ଲକ୍ଷ୍ନୌ';
      case 'Varanasi': return 'ବାରାଣାସୀ';
      case 'Indore': return 'ଇନ୍ଦୋର';
      case 'Jaipur': return 'ଜୟପୁର';
      case 'Ahmedabad': return 'ଅହମ୍ମଦାବାଦ';
      case 'Cuttack': return 'କଟକ';
      case 'Puri': return 'ପୁରୀ';
      case 'Sambalpur': return 'ସମ୍ବଲପୁର';
      case 'Ganjam': return 'ଗଞ୍ଜାମ';
      case 'Balasore': return 'ବାଲେଶ୍ୱର';
      case 'Nagpur': return 'ନାଗପୁର';
      case 'Nashik': return 'ନାଶିକ୍';
      case 'Aurangabad': return 'ଔରଙ୍ଗାବାଦ';
      case 'Kolhapur': return 'କୋଲ୍ଲାପୁର';
      case 'Belgaum': return 'ବେଲଗାଭୀ';
      case 'Dharwad': return 'ଧାରୱାଡ';
      case 'Raichur': return 'ରାୟଚୁର';
      case 'Thanjavur': return 'ଥଞ୍ଜାଭୁର';
      case 'Madurai': return 'ମଦୁରାଇ';
      case 'Coimbatore': return 'କୋଏମ୍ବାଟୁର';
      case 'Salem': return 'ସେଲମ';
      case 'Tirunelveli': return 'ତିରୁନେଲଭେଲି';
      case 'Agra': return 'ଆଗ୍ରା';
      case 'Meerut': return 'ମିରଟ';
      case 'Bareilly': return 'ବରେଲି';
      case 'Bhopal': return 'ଭୋପାଳ';
      case 'Jabalpur': return 'ଜବଲପୁର';
      case 'Sagar': return 'ସାଗର';
      case 'Rewa': return 'ରେୱା';
      case 'Jodhpur': return 'ଯୋଧପୁର';
      case 'Udaipur': return 'ଉଦୟପୁର';
      case 'Kota': return 'କୋଟା';
      case 'Bikaner': return 'ବିକାନେର';
      case 'Surat': return 'ସୁରଟ';
      case 'Rajkot': return 'ରାଜକୋଟ';
      case 'Vadodara': return 'ଭଦୋଦରା';
      case 'Junagadh': return 'ଜୁନାଗଡ';
      case 'Guntur': return 'ଗୁଣ୍ଟୁର';
      case 'Krishna': return 'କୃଷ୍ଣା';
      case 'East Godavari': return 'ପୂର୍ବ ଗୋଦାବରୀ';
      case 'Kurnool': return 'କୁର୍ନୁଲ';
      case 'Anantapur': return 'ଅନନ୍ତପୁର';
      case 'Burdwan': return 'ବର୍ଦ୍ଧମାନ';
      case 'Hooghly': return 'ହୁଗୁଳି';
      case 'Nadia': return 'ନଦିଆ';
      case 'Murshidabad': return 'ମୁର୍ଶିଦାବାଦ';
      case 'Birbhum': return 'ବୀରଭୂମ';
      case 'Patna': return 'ପାଟନା';
      case 'Gaya': return 'ଗୟା';
      case 'Muzaffarpur': return 'ମୁଜାଫରପୁର';
      case 'Bhagalpur': return 'ଭାଗଲପୁର';
      case 'Darbhanga': return 'ଦରଭଙ୍ଗା';
      case 'Karnal': return 'କର୍ଣ୍ଣାଲ';
      case 'Hisar': return 'ହିସାର';
      case 'Rohtak': return 'ରୋହତକ';
      case 'Ambala': return 'ଅମ୍ବାଲା';
      case 'Sirsa': return 'ସିରସା';
      case 'Hyderabad': return 'ହାଇଦ୍ରାବାଦ';
      case 'Warangal': return 'ୱାରାଙ୍ଗଲ';
      case 'Karimnagar': return 'କରିମନଗର';
      case 'Nizamabad': return 'ନିଜାମାବାଦ';
      case 'Khammam': return 'ଖମ୍ମାମ';
      case 'Palakkad': return 'ପାଲାକାଡ';
      case 'Thrissur': return 'ତ୍ରିଶୁର';
      case 'Ernakulam': return 'ଏର୍ଣ୍ଣାକୁଲମ';
      case 'Alappuzha': return 'ଆଲାପୁଝା';
      case 'Wayanad': return 'ୱାୟାନାଡ';
      case 'Kamrup': return 'କାମରୂପ';
      case 'Nagaon': return 'ନଗାଓଁ';
      case 'Sonitpur': return 'ସୋନିତପୁର';
      case 'Dibrugarh': return 'ଡିବ୍ରୁଗଡ଼';
      case 'Jorhat': return 'ଯୋରହାଟ';
      case 'Ranchi': return 'ରାଞ୍ଚି';
      case 'Dhanbad': return 'ଧନବାଦ';
      case 'Dumka': return 'ଦୁମକା';
      case 'Hazaribagh': return 'ହଜାରିବାଗ';
      case 'Deoghar': return 'ଦେଓଘର';
      case 'Raipur': return 'ରାୟପୁର';
      case 'Durg': return 'ଦୁର୍ଗ';
      case 'Bilaspur': return 'ବିଳାସପୁର';
      case 'Bastar': return 'ବସ୍ତର';
      case 'Korba': return 'କୋରବା';
      case 'Dehradun': return 'ଡେରାଡୁନ';
      case 'Haridwar': return 'ହରିଦ୍ୱାର';
      case 'Udham Singh Nagar': return 'ଉଧମ ସିଂ ନଗର';
      case 'Nainital': return 'ନୈନିତାଲ';
      case 'Almora': return 'ଆଲମୋଡା';
      case 'Shimla': return 'ଶିମଲା';
      case 'Kangra': return 'କାଙ୍ଗଡା';
      case 'Mandi': return 'ମଣ୍ଡି';
      case 'Solan': return 'ସୋଲାନ';
      case 'Una': return 'ଉନା';
      case 'Itanagar': return 'ଇଟାନଗର';
      case 'Tawang': return 'ତୱାଙ୍ଗ';
      case 'Ziro': return 'ଜିରୋ';
      case 'Pasighat': return 'ପାସିଘାଟ';
      case 'Bomdila': return 'ବୋମଡ଼ିଲା';
      case 'North Goa': return 'ଉତ୍ତର ଗୋଆ';
      case 'South Goa': return 'ଦକ୍ଷିଣ ଗୋଆ';
      case 'Panaji': return 'ପାଣାଜୀ';
      case 'Margao': return 'ମାଡଗାଓଁ';
      case 'Vasco': return 'ଭାସ୍କୋ';
      case 'Imphal East': return 'ଇମ୍ଫାଲ ପୂର୍ବ';
      case 'Imphal West': return 'ଇମ୍ଫାଲ ପଶ୍ଚିମ';
      case 'Thoubal': return 'ଥୌବଲ';
      case 'Bishnupur': return 'ବିଷ୍ଣୁପୁର';
      case 'Churachandpur': return 'ଚୁରାଚାନ୍ଦପୁର';
      case 'East Khasi Hills': return 'ପୂର୍ବ ଖାସି ହିଲ୍ସ';
      case 'West Garo Hills': return 'ପଶ୍ଚିମ ଗାରୋ ହିଲ୍ସ';
      case 'Ri-Bhoi': return 'ରି-ଭୋଇ';
      case 'Jaintia Hills': return 'ଜୟନ୍ତିଆ ହିଲ୍ସ';
      case 'South Garo': return 'ଦକ୍ଷିଣ ଗାରୋ';
      case 'Aizawl': return 'ଆଇଜଲ';
      case 'Lunglei': return 'ଲୁଙ୍ଗଲେଇ';
      case 'Champhai': return 'ଚମ୍ପାଇ';
      case 'Kolasib': return 'କୋଲାସିବ୍';
      case 'Serchhip': return 'ସେରଛିପ୍';
      case 'Kohima': return 'କୋହିମା';
      case 'Dimapur': return 'ଦିମାପୁର';
      case 'Mokokchung': return 'ମୋକୋକଚୁଙ୍ଗ';
      case 'Mon': return 'ମୋନ୍';
      case 'Tuensang': return 'ତୁଏନସାଙ୍ଗ';
      case 'Gangtok': return 'ଗାଙ୍ଗଟୋକ';
      case 'Namchi': return 'ନାମଚି';
      case 'Mangan': return 'ମଙ୍ଗନ';
      case 'Gyalshing': return 'ଗ୍ୟାଲସିଂ';
      case 'Rangpo': return 'ରଙ୍ଗପୋ';
      case 'Agartala': return 'ଅଗରତାଲା';
      case 'Dharmanagar': return 'ଧର୍ମନଗର';
      case 'Kailashahar': return 'କୈଳାସହର';
      case 'Ambassa': return 'ଅମ୍ବାସା';
      case 'Central Delhi': return 'ମଧ୍ୟ ଦିଲ୍ଲୀ';
      case 'South Delhi': return 'ଦକ୍ଷିଣ ଦିଲ୍ଲୀ';
      case 'North Delhi': return 'ଉତ୍ତର ଦିଲ୍ଲୀ';
      case 'East Delhi': return 'ପୂର୍ବ ଦିଲ୍ଲୀ';
      case 'West Delhi': return 'ପଶ୍ଚିମ ଦିଲ୍ଲୀ';
      case 'Srinagar': return 'ଶ୍ରୀନଗର';
      case 'Jammu': return 'ଜାମ୍ମୁ';
      case 'Anantnag': return 'ଅନନ୍ତନାଗ';
      case 'Baramulla': return 'ବାରାମୁଲ୍ଲା';
      case 'Udhampur': return 'ଉଧମପୁର';
      // SMS
      case 'sms_moisture': return `${vars.crop}: ମାଟିର ଆର୍ଦ୍ରତା କମ୍ ଅଛି। 12 ଘଣ୍ଟା ମଧ୍ୟରେ ଜଳସେଚନ କରନ୍ତୁ। ପାଣି ବଞ୍ଚାଇବା ପାଇଁ ଡ୍ରିପ୍ ପଦ୍ଧତି ବ୍ୟବହାର କରନ୍ତୁ।`;
      case 'sms_price_up': return `${vars.region} ରେ ${vars.crop} ମୂଲ୍ୟ ବଢୁଛି। ଭଲ ଲାଭ ପାଇଁ ଆଉ 10 ଦିନ ସଂରକ୍ଷଣ କରନ୍ତୁ। ଅନୁମାନିତ ଲାଭ: ଟଙ୍କା 3,000+।`;
      case 'sms_price_down': return `${vars.region} ରେ ${vars.crop} ମୂଲ୍ୟ କମୁଛି। କ୍ଷତିରୁ ବଞ୍ଚିବା ପାଇଁ ଶୀଘ୍ର ବିକ୍ରି କରନ୍ତୁ। 3 ଦିନରୁ ଅଧିକ ସଂରକ୍ଷଣ କରନ୍ତୁ ନାହିଁ।`;
      case 'sms_profit_vol': return `ପରାମର୍ଶ: ଆଗାମୀ ${vars.season} ସମୟରେ ${vars.region} ରେ ${vars.crop} ଚାଷରୁ ଦୂରେଇ ରୁହନ୍ତୁ। ଅଧିକ କ୍ଷତିର ଆଶଙ୍କା। ସୁରକ୍ଷିତ ଫସଲ ଚେଷ୍ଟା କରନ୍ତୁ।`;
      case 'sms_pest': return `${vars.region} ରେ କୀଟ ସତର୍କତା! ${vars.crop} କ୍ଷେତ ଯାଞ୍ଚ କରନ୍ତୁ। ନିମ ସ୍ପ୍ରେ ବ୍ୟବହାର କରନ୍ତୁ। କୃଷି ଅଧିକାରୀଙ୍କୁ ଜଣାନ୍ତୁ।`;
      case 'sms_disease_risk': return `ସତର୍କତା: ${vars.region} ରେ ${vars.crop} ପାଇଁ ଉଚ୍ଚ ରୋଗ ଆଶଙ୍କା | 3 ଦିନ ମଧ୍ୟରେ ଫଙ୍ଗିସାଇଡ୍ ସ୍ପ୍ରେ କରନ୍ତୁ | ପ୍ରତିଦିନ ପତ୍ର ଯାଞ୍ଚ କରନ୍ତୁ |`;
      case 'Medium': return 'ମଧ୍ୟମ';
      // Pests
      case 'Stem Borer': return 'କାଣ୍ଡ ବିନ୍ଧା ପୋକ (Stem Borer)';
      case 'Whitefly': return 'ଧଳା ମାଛି (Whitefly)';
      case 'Aphids': return 'ଜଉ ପୋକ (Aphids)';
      case 'Fall Armyworm': return 'ଫଲ୍ ଆର୍ମିୱର୍ମ';
      case 'Bollworm': return 'ବୋଲୱର୍ମ';
      case 'Fruit Fly': return 'ଫଳ ମାଛି';
      case 'Leaf Miner': return 'ଲିଫ୍ ମାଇନର୍';
      case 'Pod Borer': return 'ଛୁଇଁ ବିନ୍ଧା ପୋକ (Pod Borer)';
      // Levels
      case 'Low': return 'କମ୍';
      case 'Moderate': return 'ମଧ୍ୟମ';
      case 'High': return 'ଉଚ୍ଚ';
      default: return templateId;
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
    case 'chat_disease': return `Based on current ${vars.season} in ${vars.region}, ${vars.crop} has ${vars.riskLevel} disease risk (${vars.risk}%). Top diseases: ${vars.diseases}. Advisory: ${vars.rec}`;
    case 'chat_profit': return `For ${vars.crop} in ${vars.region} (${vars.season}): Estimated yield is ${vars.yield} ${vars.unit}/acre. Potential profit: ${vars.profit} per acre. Market price: ${vars.price}/q.`;
    case 'chat_market': return `Market advice for ${vars.crop} in ${vars.region}: ${vars.decision}. ${vars.reason}`;
    case 'chat_water': return `Irrigation advice for ${vars.crop} in ${vars.region}: ${vars.moist}% soil moisture. ${vars.need}. Recommendation: ${vars.rec}`;
    case 'chat_pest': return `Pest outlook for ${vars.crop} in ${vars.region}: ${vars.risk} probability. Key pests: ${vars.pests}. Advice: ${vars.rec}`;
    case 'chat_weather': return `Weather impact on ${vars.season} farming in ${vars.region}: ${vars.insight}`;
    case 'chat_advisory': return `Crop advisory for ${vars.region} during ${vars.season}: Safe crops: ${vars.safe}. Avoid: ${vars.avoid}.`;
    case 'chat_default': return `I understand you're asking about "${vars.input}". Here's what I can help with for ${vars.crop} in ${vars.region}:\n\n1. Disease info\n2. Profit estimates\n3. Market advice\n4. Irrigation guidance\n\nTry asking a specific question!`;
    default: return templateId;
  }
}

const CROP_ENTITY_MAP: Record<string, string> = {
  'Rice': 'Rice', 'चावल': 'Rice', 'ଧାନ': 'Rice',
  'Wheat': 'Wheat', 'गेहूँ': 'Wheat', 'ଗହମ': 'Wheat',
  'Maize': 'Maize', 'मक्का': 'Maize', 'ମକ୍କା': 'Maize',
  'Cotton': 'Cotton', 'कपास': 'Cotton', 'କପା': 'Cotton',
  'Sugarcane': 'Sugarcane', 'गन्ना': 'Sugarcane', 'ଆଖୁ': 'Sugarcane',
  'Soybean': 'Soybean', 'सोयाबीन': 'Soybean', 'ସୋୟାବିନ୍': 'Soybean',
  'Groundnut': 'Groundnut', 'मूंगफली': 'Groundnut', 'ଚିନାବାଦାମ': 'Groundnut',
  'Tomato': 'Tomato', 'टमाटर': 'Tomato', 'ଟମାଟୋ': 'Tomato',
  'Potato': 'Potato', 'आलू': 'Potato', 'ଆଳୁ': 'Potato', 'potatoes': 'Potato',
  'Onion': 'Onion', 'प्याज': 'Onion', 'ପିଆଜ': 'Onion',
  'Pepper': 'Pepper', 'काली मिर्च': 'Pepper', 'ଗୋଲମରିଚ': 'Pepper'
};

export function simulateDiseaseDetection(cropType: string, language?: string): DiseaseDetectionResult {
  const seed = cropType + Date.now().toString().slice(-4);
  const isHealthy = seededRandom(seed, 500) < 0.3; // 30% chance of healthy

  if (isHealthy) {
    return {
      diseaseName: tLocale(language, "Healthy", {}),
      severity: "Healthy",
      confidence: 0.92 + seededRandom(seed, 501) * 0.06, // 92-98%
      description: tLocale(language, "Healthy_desc", { crop: tLocale(language, cropType, {}) }),
      remedies: [],
      preventiveMeasures: [
        tLocale(language, "Healthy_prev1", {}),
        tLocale(language, "Healthy_prev2", {}),
      ],
    };
  }

  const db = DISEASE_DB[cropType] || DISEASE_DB["Rice"];
  const idx = hash(seed) % db.diseases.length;
  const disease = db.diseases[idx];
  const confidence = 0.72 + seededRandom(seed, 1) * 0.23; // 72-95%

  return {
    diseaseName: tLocale(language, disease.name, {}),
    severity: disease.severity,
    confidence: Math.round(confidence * 100) / 100,
    description: tLocale(language, disease.name + "_desc", {}) !== disease.name + "_desc" ? tLocale(language, disease.name + "_desc", {}) : disease.description,
    remedies: disease.remedies.map(r => tLocale(language, r, {}) !== r ? tLocale(language, r, {}) : r),
    preventiveMeasures: disease.preventive.map(p => tLocale(language, p, {}) !== p ? tLocale(language, p, {}) : p),
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
    name: tLocale(input.language, d.name, {}),
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
    { item: tLocale(input.language, "Seeds & Seedlings", {}), cost: Math.round(inputCost * 0.12) },
    { item: tLocale(input.language, "Fertilizers", {}), cost: Math.round(inputCost * 0.22) },
    { item: tLocale(input.language, "Pesticides & Fungicides", {}), cost: Math.round(inputCost * 0.12) },
    { item: tLocale(input.language, "Labour", {}), cost: Math.round(inputCost * 0.28) },
    { item: tLocale(input.language, "Irrigation", {}), cost: Math.round(inputCost * 0.1) },
    { item: tLocale(input.language, "Machinery & Equipment", {}), cost: Math.round(inputCost * 0.1) },
    { item: tLocale(input.language, "Transport & Misc", {}), cost: Math.round(inputCost * 0.06) },
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

// Crop-specific trend bias: durable crops tend to appreciate in storage,
// perishables tend to lose value quickly.
const CROP_TREND_BIAS: Record<string, number> = {
  Rice: 0.65, Wheat: 0.60, Maize: 0.58, Soybean: 0.62, Groundnut: 0.60,
  Cotton: 0.55, Sugarcane: 0.50,
  Tomato: 0.30, Potato: 0.35, Onion: 0.38,
};

export function simulatePriceForecast(input: PriceForecastInput): PriceForecastResult {
  // Seed includes all user inputs + today's date so:
  // - different inputs → different decision
  // - same inputs on a different day → refreshed decision (feels live)
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const seed = `${input.cropType}-${input.region}-${Math.round(input.currentPrice)}-${Math.round(input.quantityQuintals)}-${Math.round(input.storageCostPerDay)}-${today}`;

  // Generate price timeline (30 days)
  // Use crop-specific bias so durable crops often trend up, perishables often trend down
  const trendBias = CROP_TREND_BIAS[input.cropType] ?? 0.5;
  const trendSeed = seededRandom(`${input.cropType}-${input.region}-${today}`, 7);
  const trend = trendSeed > (1 - trendBias) ? 1 : -1;
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

  const locCrop = tLocale(input.language, input.cropType, {});
  const locTrend = tLocale(input.language, priceTrend === "Rising" ? "Rising" : priceTrend === "Falling" ? "Falling" : "Stable", {});
  const locSpoilage = tLocale(input.language, spoilageRisk, {});

  let reasoning: string;
  if (decision === "Store") {
    if (input.language === 'hi') {
      reasoning = `${locCrop} की कीमतें अगले ${bestDay} दिनों में ${priceTrend === "Rising" ? "बढ़ने" : "अनुकूल रहने"} की उम्मीद है। भंडारण लागत के बाद ${input.quantityQuintals} क्विंटल स्टोर करने से आप अतिरिक्त रु ${Math.round(netGainLoss).toLocaleString("en-IN")} कमा सकते हैं। खराब होने का जोखिम ${locSpoilage.toLowerCase()} है।`;
    } else if (input.language === 'or') {
      reasoning = `ପରବର୍ତ୍ତୀ ${bestDay} ଦିନ ମଧ୍ୟରେ ${locCrop} ମୂଲ୍ୟ ${priceTrend === "Rising" ? "ବଢିବା" : "ଅନୁକୂଳ ରହିବା"} ର ଆଶା ଅଛି | ଷ୍ଟୋରେଜ୍ ଖର୍ଚ୍ଚ ପରେ ${input.quantityQuintals} କ୍ୱିଣ୍ଟାଲ୍ ସଂରକ୍ଷଣ କରି ଆପଣ ଅତିରିକ୍ତ ଟଙ୍କା ${Math.round(netGainLoss).toLocaleString("en-IN")} ରୋଜଗାର କରିପାରିବେ | ନଷ୍ଟ ହେବାର ଆଶଙ୍କା ${locSpoilage.toLowerCase()} ଅଛି |`;
    } else {
      reasoning = `Prices for ${input.cropType} are expected to ${priceTrend.toLowerCase() === "rising" ? "rise" : "remain favorable"} over the next ${bestDay} days. Storing ${input.quantityQuintals} quintals could earn you an additional Rs ${Math.round(netGainLoss).toLocaleString("en-IN")} after storage costs. Spoilage risk is ${spoilageRisk.toLowerCase()}.`;
    }
  } else {
    if (spoilageRisk === "High") {
      if (input.language === 'hi') {
        reasoning = `हालांकि कीमतों में सुधार हो सकता है, लेकिन ${bestDay} दिनों में ${locCrop} के खराब होने का जोखिम बहुत अधिक है। नुकसान से बचने के लिए अभी रु ${input.currentPrice}/क्विंटल पर बेचना बेहतर विकल्प है।`;
      } else if (input.language === 'or') {
        reasoning = `ଯଦିଓ ମୂଲ୍ୟରେ ଉନ୍ନତି ହୋଇପାରେ, ${bestDay} ଦିନ ମଧ୍ୟରେ ${locCrop} ନଷ୍ଟ ହେବାର ଆଶଙ୍କା ବହୁତ ଅଧିକ | କ୍ଷତିରୁ ବଞ୍ଚିବା ପାଇଁ ବର୍ତ୍ତମାନ ଟଙ୍କା ${input.currentPrice}/କ୍ୱିଣ୍ଟାଲ୍ ରେ ବିକ୍ରି କରିବା ଏକ ଭଲ ବିକଳ୍ପ |`;
      } else {
        reasoning = `While prices may improve, the spoilage risk for ${input.cropType} over ${bestDay} days is too high. Selling now at Rs ${input.currentPrice}/quintal is the safer choice to avoid losses.`;
      }
    } else if (priceTrend === "Falling") {
      if (input.language === 'hi') {
        reasoning = `${locCrop} की कीमतें नीचे गिर रही हैं। अभी रु ${input.currentPrice}/क्विंटल पर बेचने से कीमतों में और गिरावट से बचा जा सकता है। भंडारण लागत संभावित लाभ से अधिक होगी।`;
      } else if (input.language === 'or') {
        reasoning = `${locCrop} ମୂଲ୍ୟ ହ୍ରାସ ପାଉଛି | ବର୍ତ୍ତମାନ ଟଙ୍କା ${input.currentPrice}/କ୍ୱିଣ୍ଟାଲ୍ ରେ ବିକ୍ରି କରିବା ଦ୍ୱାରା ମୂଲ୍ୟରେ ଅଧିକ ହ୍ରାସରୁ ରକ୍ଷା ମିଳିପାରିବ | ଷ୍ଟୋରେଜ୍ ଖର୍ଚ୍ଚ ସମ୍ଭାବ୍ୟ ଲାଭଠାରୁ ଅଧିକ ହେବ |`;
      } else {
        reasoning = `Prices for ${input.cropType} are trending downward. Selling now at Rs ${input.currentPrice}/quintal avoids further price drops. Storage costs would exceed potential gains.`;
      }
    } else {
      if (input.language === 'hi') {
        reasoning = `वर्तमान बाजार की स्थिति अभी रु ${input.currentPrice}/क्विंटल पर ${locCrop} बेचने का सुझाव देती है। संभावित मूल्य सुधार रु ${input.storageCostPerDay}/क्विंटल/दिन की भंडारण लागत को उचित नहीं ठहराता है।`;
      } else if (input.language === 'or') {
        reasoning = `ବର୍ତ୍ତମାନର ବଜାର ସ୍ଥିତି ବର୍ତ୍ତମାନ ଟଙ୍କା ${input.currentPrice}/କ୍ୱିଣ୍ଟାଲ୍ ରେ ${locCrop} ବିକ୍ରି କରିବାକୁ ପରାମର୍ଶ ଦିଏ | ସମ୍ଭାବ୍ୟ ମୂଲ୍ୟ ବୃଦ୍ଧି ଟଙ୍କା ${input.storageCostPerDay}/କ୍ୱିଣ୍ଟାଲ୍/ଦିନର ଷ୍ଟୋରେଜ୍ ଖର୍ଚ୍ଚକୁ ଯଥାର୍ଥ କରେ ନାହିଁ |`;
      } else {
        reasoning = `Current market conditions suggest selling ${input.cropType} now at Rs ${input.currentPrice}/quintal. The potential price improvement doesn't justify storage costs of Rs ${input.storageCostPerDay}/quintal/day.`;
      }
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

const ALL_CROPS = ["Rice", "Wheat", "Cotton", "Sugarcane", "Tomato", "Potato", "Onion", "Maize", "Soybean", "Groundnut", "Pepper"];

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

    const locCrop = tLocale(input.language, crop, {});
    const locRegion = tLocale(input.language, input.region, {});
    const locSeason = tLocale(input.language, input.season, {});

    const reasons: string[] = [];
    if (climateMismatch > 60) {
      reasons.push(tLocale(input.language, "cc_unsuited", { crop: locCrop, region: locRegion, season: locSeason }));
    }
    if (diseaseRisk > 50) {
      reasons.push(tLocale(input.language, "cc_disease", { crop: locCrop, risk: diseaseRisk }));
    }
    if (profitVolatility > 50) {
      reasons.push(tLocale(input.language, "cc_profit", { crop: locCrop, region: locRegion }));
    }
    if (input.season === "Kharif" && ["Wheat"].includes(crop)) {
      reasons.push(input.language === 'hi' ? `${locCrop} एक रबी फसल है - खरीफ में उगाने से खराब पैदावार होगी` : input.language === 'or' ? `${locCrop} ଏକ ରବି ଫସଲ - ଖରିଫରେ ଚାଷ କଲେ ଅମଳ କମ୍ ହେବ` : `${crop} is a Rabi crop - growing in Kharif will result in poor yields`);
    }
    if (input.season === "Rabi" && ["Rice"].includes(crop)) {
      reasons.push(input.language === 'hi' ? `${locCrop} मुख्य रूप से खरीफ की फसल है - रबी का मौसम इसके लिए अनुकूल नहीं है` : input.language === 'or' ? `${locCrop} ମୁଖ୍ୟତଃ ଏକ ଖରିଫ୍ ଫସଲ - ରବି ଋତୁ ଏଥିପାଇଁ ଅନୁକୂଳ ନୁହେଁ` : `${crop} is primarily a Kharif crop - Rabi season is suboptimal`);
    }
    if (climate.rainfall === "low" && ["Rice", "Sugarcane"].includes(crop)) {
      reasons.push(input.language === 'hi' ? `${locCrop} को अधिक पानी की आवश्यकता होती है, जो ${locRegion} प्रदान नहीं कर सकता है` : input.language === 'or' ? `${locCrop} କୁ ଅଧିକ ଜଳର ଆବଶ୍ୟକତା ଅଛି, ଯାହା ${locRegion} ପ୍ରଦାନ କରିପାରିବ ନାହିଁ` : `${crop} requires high water availability, which ${input.region} may not provide`);
    }

    if (reasons.length === 0) {
      reasons.push(input.language === 'hi' ? `${locSeason} के दौरान ${locRegion} में ${locCrop} की सीमित ऐतिहासिक सफलता रही है` : input.language === 'or' ? `${locSeason} ସମୟରେ ${locRegion} ରେ ${locCrop} ର ସୀମିତ ଐତିହାସିକ ସଫଳତା ରହିଛି` : `${crop} has limited historical success in ${input.region} during ${input.season} season`);
    }

    const riskLevel: "Low" | "Medium" | "High" | "Very High" =
      riskScore > 75 ? "Very High" : riskScore > 55 ? "High" : riskScore > 35 ? "Medium" : "Low";

    return { cropName: crop, riskScore, riskLevel, reasons, diseaseRisk, profitVolatility, climateMismatch };
  }).sort((a, b) => b.riskScore - a.riskScore);

  const safeCrops = climate.suitableCrops.slice(0, 4).map(name => ({
    name: tLocale(input.language, name, {}),
    reason: tLocale(input.language, "cc_well", { region: tLocale(input.language, input.region, {}), season: tLocale(input.language, input.season, {}) }),
  }));

  const seasonInsights: Record<string, string> = {
    Kharif: input.language === 'hi' 
      ? `${tLocale(input.language, input.region, {})} में खरीफ का मौसम (जून-अक्टूबर) मानसून की बारिश लाता है। पानी पसंद करने वाली फसलों पर ध्यान दें। उच्च आर्द्रता के कारण फंगल रोगों से सावधान रहें।`
      : input.language === 'or'
      ? `${tLocale(input.language, input.region, {})} ରେ ଖରିଫ୍ ଋତୁ (ଜୁନ୍-ଅକ୍ଟୋବର) ମୌସୁମୀ ବର୍ଷା ଆଣିଥାଏ | ଜଳ ପସନ୍ଦ କରୁଥିବା ଫସଲ ଉପରେ ଧ୍ୟାନ ଦିଅନ୍ତୁ | ଅଧିକ ଆର୍ଦ୍ରତା ଯୋଗୁଁ ଫଙ୍ଗାଲ୍ ରୋଗ ପ୍ରତି ସତର୍କ ରୁହନ୍ତୁ |`
      : `Kharif season in ${input.region} (June-October) brings monsoon rains. Focus on water-loving crops. Watch for fungal diseases due to high humidity.`,
    Rabi: input.language === 'hi'
      ? `${tLocale(input.language, input.region, {})} में रबी का मौसम (अक्टूबर-मार्च) ठंडा तापमान प्रदान करता है। गेहूं, सरसों और ठंडे मौसम की सब्जियों के लिए आदर्श। कुल मिलाकर बीमारी का दबाव कम।`
      : input.language === 'or'
      ? `${tLocale(input.language, input.region, {})} ରେ ରବି ଋତୁ (ଅକ୍ଟୋବର-ମାର୍ଚ୍ଚ) ଥଣ୍ଡା ତାପମାତ୍ରା ପ୍ରଦାନ କରିଥାଏ | ଗହମ, ସୋରିଷ ଏବଂ ଥଣ୍ଡା ଦିନିଆ ପନିପରିବା ପାଇଁ ଆଦର୍ଶ | ସାମଗ୍ରିକ ଭାବରେ ରୋଗ ଚାପ କମ୍ |`
      : `Rabi season in ${input.region} (October-March) offers cooler temperatures. Ideal for wheat, mustard, and cool-season vegetables. Lower disease pressure overall.`,
    Zaid: input.language === 'hi'
      ? `${tLocale(input.language, input.region, {})} में जायद का मौसम (मार्च-जून) गर्म और शुष्क रहता है। गर्मी सहने वाली, कम अवधि की फसलें चुनें। इस अवधि के दौरान सिंचाई महत्वपूर्ण है।`
      : input.language === 'or'
      ? `${tLocale(input.language, input.region, {})} ରେ ଜୈଦ୍ ଋତୁ (ମାର୍ଚ୍ଚ-ଜୁନ୍) ଗରମ ଏବଂ ଶୁଷ୍କ ରହେ | ତାପ ସହ୍ୟ କରିପାରୁଥିବା, କମ୍ ଅବଧିର ଫସଲ ବାଛନ୍ତୁ | ଏହି ସମୟ ମଧ୍ୟରେ ଜଳସେଚନ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ |`
      : `Zaid season in ${input.region} (March-June) is hot and dry. Choose heat-tolerant, short-duration crops. Irrigation is critical during this period.`,
  };

  return {
    cropsToAvoid: cropsToAvoid.map(c => ({ ...c, cropName: tLocale(input.language, c.cropName, {}) })),
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
  const lang = input.language;
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
      crop: tLocale(lang, crop, {}),
      riskPercent: Math.round(Math.min(outbreakProbability * (0.6 + seededRandom(`${seed}-${crop}-${p.pest}`, 2) * 0.5), 95)),
      pest: tLocale(lang, p.pest, {}),
    })))
    .sort((a, b) => b.riskPercent - a.riskPercent)
    .slice(0, 8);

  // District-level alerts
  const districts = DISTRICT_MAP[input.region] || DISTRICT_MAP["Punjab"];
  const districtAlerts = districts.map((district, i) => {
    const distRisk = outbreakProbability + (seededRandom(`${seed}-${district}`, i) - 0.5) * 30;
    const level: "Low" | "Moderate" | "High" = distRisk < 35 ? "Low" : distRisk < 65 ? "Moderate" : "High";
    const pestIdx = Math.floor(seededRandom(`${seed}-${district}`, i + 10) * pests.length);
    return { 
      district: tLocale(lang, district, {}), 
      level, 
      pest: tLocale(lang, pests[pestIdx].pest, {}) 
    };
  });

  const preventiveAdvisory: string[] = [];
  if (riskZone === "High") {
    if (lang === 'hi') {
      preventiveAdvisory.push("सभी खेतों में तुरंत फेरोमोन ट्रैप लगाएं");
      preventiveAdvisory.push("48 घंटों के भीतर अनुशंसित जैव-कीटनाशकों का उपयोग करें");
      preventiveAdvisory.push("खेतों की रोजाना निगरानी करें और किसी भी असामान्य कीट गतिविधि की रिपोर्ट करें");
      preventiveAdvisory.push("क्षेत्रव्यापी प्रबंधन के लिए पड़ोसी किसानों के साथ समन्वय करें");
    } else if (lang === 'or') {
      preventiveAdvisory.push("ତୁରନ୍ତ ସବୁ କ୍ଷେତରେ ଫେରୋମୋନ୍ ଟ୍ରାପ୍ ଲଗାନ୍ତୁ");
      preventiveAdvisory.push("୪୮ ଘଣ୍ଟା ମଧ୍ୟରେ ସୁପାରିଶ କରାଯାଇଥିବା ଜୈବ-କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ");
      preventiveAdvisory.push("ପ୍ରତିଦିନ କ୍ଷେତର ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ କୌଣସି ଅସ୍ବାଭାବିକ କୀଟ ସଙ୍କେତ ମିଳିଲେ ଜଣାନ୍ତୁ");
      preventiveAdvisory.push("ବ୍ୟାପକ ପରିଚାଳନା ପାଇଁ ପଡ଼ୋଶୀ ଚାଷୀଙ୍କ ସହ ସମନ୍ୱୟ ରକ୍ଷା କରନ୍ତୁ");
    } else {
      preventiveAdvisory.push("Deploy pheromone traps immediately across all fields");
      preventiveAdvisory.push("Apply recommended bio-pesticides within 48 hours");
      preventiveAdvisory.push("Scout fields daily and report any unusual pest activity");
      preventiveAdvisory.push("Coordinate with neighboring farmers for area-wide management");
    }
  } else if (riskZone === "Moderate") {
    if (lang === 'hi') {
      preventiveAdvisory.push("जल्दी पता लगाने के लिए पीले चिपचिपे ट्रैप लगाएं");
      preventiveAdvisory.push("कीटों के संकेतों के लिए हर 2-3 दिनों में खेतों की निगरानी करें");
      preventiveAdvisory.push("त्वरित प्रतिक्रिया के लिए जैव-कीटनाशक स्टॉक तैयार रखें");
    } else if (lang === 'or') {
      preventiveAdvisory.push("ଶୀଘ୍ର ଚିହ୍ନଟ ପାଇଁ ହଳଦିଆ ଷ୍ଟିକି ଟ୍ରାପ୍ ଲଗାନ୍ତୁ");
      preventiveAdvisory.push("କୀଟ ସଙ୍କେତ ପାଇଁ ପ୍ରତି ୨-୩ ଦିନରେ କ୍ଷେତ ନୀରିକ୍ଷଣ କରନ୍ତୁ");
      preventiveAdvisory.push("ଶୀଘ୍ର ପ୍ରତିକ୍ରିୟା ପାଇଁ ଜୈବ-କୀଟନାଶକ ଷ୍ଟକ୍ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ");
    } else {
      preventiveAdvisory.push("Install yellow sticky traps for early detection");
      preventiveAdvisory.push("Monitor fields every 2-3 days for pest signs");
      preventiveAdvisory.push("Keep bio-pesticide stock ready for quick response");
    }
  } else {
    if (lang === 'hi') {
      preventiveAdvisory.push("साप्ताहिक रूप से नियमित खेत निगरानी जारी रखें");
      preventiveAdvisory.push("खेत की स्वच्छता बनाए रखें और फसल अवशेषों को हटा दें");
      preventiveAdvisory.push("किसी तत्काल कीट नियंत्रण कार्रवाई की आवश्यकता नहीं है");
    } else if (lang === 'or') {
      preventiveAdvisory.push("ସାପ୍ତାହିକ ନିୟମିତ କ୍ଷେତ ନୀରିକ୍ଷଣ ଜାରି ରଖନ୍ତୁ");
      preventiveAdvisory.push("କ୍ଷେତର ପରିଚ୍ଛନ୍ନତା ବଜାୟ ରଖନ୍ତୁ ଏବଂ ଫସଲ ଅବଶିଷ୍ଟାଂଶ ହଟାନ୍ତୁ");
      preventiveAdvisory.push("ତୁରନ୍ତ କୌଣସି କୀଟ ନିୟନ୍ତ୍ରଣ କାର୍ଯ୍ୟାନୁଷ୍ଠାନର ଆବଶ୍ୟକତା ନାହିଁ");
    } else {
      preventiveAdvisory.push("Continue routine field monitoring weekly");
      preventiveAdvisory.push("Maintain field hygiene and remove crop residues");
      preventiveAdvisory.push("No immediate pest control action needed");
    }
  }

  let historicalComparison = "";
  if (lang === 'hi') {
    historicalComparison = outbreakProbability > 60
      ? `${input.region} में वर्तमान स्थितियां 2019 के ${input.season} सीजन के प्रकोप के समान हैं जब महत्वपूर्ण कीट क्षति की सूचना मिली थी। शीघ्र कार्रवाई की दृढ़ता से सलाह दी जाती है।`
      : outbreakProbability > 35
      ? `स्थितियां पिछले प्रकोप वर्षों के मध्यम रूप से समान हैं। ${input.region} के लिए निवारक निगरानी की सिफारिश की जाती है।`
      : `${input.region} में वर्तमान कीट दबाव ऐतिहासिक औसत से नीचे है। सामान्य सावधानियां पर्याप्त हैं।`;
  } else if (lang === 'or') {
    historicalComparison = outbreakProbability > 60
      ? `${input.region} ରେ ବର୍ତ୍ତମାନର ସ୍ଥିତି ୨୦୧୯ ${input.season} ରୁତୁର ପ୍ରାଦୁର୍ଭାବ ସହିତ ସମାନ ଯେତେବେଳେ କୀଟ ଯୋଗୁଁ ବ୍ୟାପକ କ୍ଷତି ହୋଇଥିଲା | ଶୀଘ୍ର ପଦକ୍ଷେପ ନେବାକୁ ପରାମର୍ଶ ଦିଆଯାଇଛି।`
      : outbreakProbability > 35
      ? `ସ୍ଥିତି ପୂର୍ବ ପ୍ରାଦୁର୍ଭାବ ବର୍ଷଗୁଡ଼ିକ ସହିତ ସାମାନ୍ୟ ସମାନ | ${input.region} ପାଇଁ ସତର୍କତାମୂଳକ ନୀରିକ୍ଷଣ ସୁପାରିଶ କରାଯାଏ |`
      : `${input.region} ରେ ବର୍ତ୍ତମାନର କୀଟ ଚାପ ଅତୀତର ହାରାହାରି ତୁଳନାରେ କମ୍ ଅଛି | ସାଧାରଣ ସତର୍କତା ଯଥେଷ୍ଟ।`;
  } else {
    historicalComparison = outbreakProbability > 60
      ? `Current conditions in ${input.region} are similar to the 2019 ${input.season} season outbreak when significant pest damage was reported. Early action is strongly advised.`
      : outbreakProbability > 35
      ? `Conditions are moderately similar to past outbreak years. Preventive monitoring is recommended for ${input.region}.`
      : `Current pest pressure in ${input.region} is below historical averages. Normal precautions are sufficient.`;
  }

  return { outbreakProbability, riskZone, affectedCrops, districtAlerts, preventiveAdvisory, historicalComparison };
}

// ─── SMS Alert System ───

export function simulateSmsAlerts(input: SmsAlertInput): SmsAlertResult {
  const seed = `${input.cropType}-${input.region}-${input.season}-sms`;
  const phone = input.farmerPhone || "+91-XXXXX-XXXXX";
  const now = new Date();
  const alerts: SmsAlert[] = [];
  let id = 1;
  const lang = input.language;

  // Generate contextual alerts based on simulated conditions
  const riskVal = seededRandom(seed, 1);
  const profitVal = seededRandom(seed, 2);
  const priceVal = seededRandom(seed, 3);
  const moistureVal = seededRandom(seed, 4);

  const locCrop = tLocale(lang, input.cropType, {});
  const locRegion = tLocale(lang, input.region, {});
  const locSeason = tLocale(lang, input.season, {});

  // High disease risk alert
  if (riskVal > 0.4) {
    alerts.push({
      id: `sms-${id++}`,
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
      phone,
      message: tLocale(lang, "sms_disease_risk", { crop: locCrop, region: locRegion }),
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
      message: tLocale(lang, "sms_moisture", { crop: locCrop }),
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
      message: tLocale(lang, "sms_price_up", { crop: locCrop, region: locRegion }),
      triggerEvent: "Price Trend Change",
      priority: "Normal",
      delivered: true,
    });
  } else {
    alerts.push({
      id: `sms-${id++}`,
      timestamp: new Date(now.getTime() - 14400000).toISOString(),
      phone,
      message: tLocale(lang, "sms_price_down", { crop: locCrop, region: locRegion }),
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
      message: tLocale(lang, "sms_profit_vol", { crop: locCrop, season: locSeason, region: locRegion }),
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
      message: tLocale(lang, "sms_pest", { crop: locCrop, region: locRegion }),
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
  let crop = input.cropType || "Rice";
  let region = input.region || "Punjab";
  let season = input.season || "Kharif";
  const message = input.message.toLowerCase();
  const lang = input.language;

  // 1. Dynamic entity detection (handles Hindi/Odia names too)
  for (const [key, value] of Object.entries(CROP_ENTITY_MAP)) {
    if (message.includes(key.toLowerCase())) {
      crop = value;
      break;
    }
  }
  const detectedRegion = REGION_LIST.find(r => message.includes(r.toLowerCase()));
  if (detectedRegion) region = detectedRegion;
  const detectedSeason = SEASON_LIST.find(s => message.includes(s.toLowerCase()));
  if (detectedSeason) season = detectedSeason;

  // 2. Specialized Categorical Responses
  
  // Disease
  if (/disease|blight|infection|sick|bimar|rog|beemari/i.test(message)) {
    const risk = simulateDiseaseRisk({ cropType: crop, region, season, language: lang, temperature: 28, humidity: 75, rainfall: 10 });
    return {
      reply: tLocale(lang, 'chat_disease', {
        crop: tLocale(lang, crop, {}),
        season: tLocale(lang, season, {}),
        region: tLocale(lang, region, {}),
        riskLevel: tLocale(lang, risk.riskLevel, {}),
        risk: risk.riskPercentage,
        diseases: risk.topDiseases.map(d => d.name).join(", "),
        rec: risk.recommendation
      }),
      suggestions: getSuggestions(message, lang)
    };
  }

  // Profit/Earnings
  if (/profit|earn|money|income|kamai|munafa|labha/i.test(message)) {
    const profit = simulateProfitPrediction({ cropType: crop, region, season, acreage: 1, soilType: "Loamy", irrigationType: "Drip", language: lang });
    return {
      reply: tLocale(lang, 'chat_profit', {
        crop: tLocale(lang, crop, {}),
        season: tLocale(lang, season, {}),
        region: tLocale(lang, region, {}),
        yield: Math.round(profit.expectedYieldPerAcre),
        unit: tLocale(lang, profit.yieldUnit, {}),
        profit: `Rs ${profit.profitPerAcre.toLocaleString()}`,
        price: profit.expectedMarketPrice
      }),
      suggestions: getSuggestions(message, lang)
    };
  }

  // Sell/Store/Market
  if (/sell|store|market|price|bech|rakh|mandi|bazar/i.test(message)) {
    const price = simulatePriceForecast({ cropType: crop, region, currentPrice: 2200, quantityQuintals: 20, storageCostPerDay: 2, language: lang });
    return {
      reply: tLocale(lang, 'chat_market', {
        crop: tLocale(lang, crop, {}),
        region: tLocale(lang, region, {}),
        decision: tLocale(lang, price.decision, {}),
        reason: price.reasoning
      }),
      suggestions: getSuggestions(message, lang)
    };
  }

  // Water/Irrigation
  if (/water|irrigat|paani|sinchai|jala/i.test(message)) {
    const irrigation = simulateIrrigation({ cropType: crop, region, soilType: "Loamy", temperature: 30, humidity: 65, recentRainfall: 5, season, language: lang });
    return {
      reply: tLocale(lang, 'chat_water', {
        crop: tLocale(lang, crop, {}),
        region: tLocale(lang, region, {}),
        moist: irrigation.soilMoisturePercent,
        need: tLocale(lang, irrigation.irrigationNeed, {}),
        rec: irrigation.recommendation
      }),
      suggestions: getSuggestions(message, lang)
    };
  }

  // Pest
  if (/pest|keeda|insect|outbreak|poka/i.test(message)) {
    const pest = simulatePestOutbreak({ region, season, temperature: 28, humidity: 75, recentRainfall: 10, language: lang });
    return {
      reply: tLocale(lang, 'chat_pest', {
        crop: tLocale(lang, crop, {}),
        region: tLocale(lang, region, {}),
        risk: tLocale(lang, pest.riskZone, {}),
        pests: pest.affectedCrops.filter(c => c.crop.includes(crop) || c.crop === crop).map(c => c.pest).join(", ") || tLocale(lang, "Aphids", {}),
        rec: pest.preventiveAdvisory[0]
      }),
      suggestions: getSuggestions(message, lang)
    };
  }

  // Weather
  if (/weather|rain|barish|mausam|panipaga/i.test(message)) {
    const advisory = simulateRiskAdvisory({ region, season, language: lang });
    return {
      reply: tLocale(lang, 'chat_weather', {
        region: tLocale(lang, region, {}),
        season: tLocale(lang, season, {}),
        insight: advisory.seasonalInsight
      }),
      suggestions: getSuggestions(message, lang)
    };
  }

  // Advisory (What to grow)
  if (/what.*grow|kya.*ugau|kaun.*fasal|kana.*chasa/i.test(message)) {
    const advisory = simulateRiskAdvisory({ region, season, language: lang });
    return {
      reply: tLocale(lang, 'chat_advisory', {
        region: tLocale(lang, region, {}),
        season: tLocale(lang, season, {}),
        safe: advisory.safeCrops.map(c => c.name).join(", "),
        avoid: advisory.cropsToAvoid.slice(0, 2).map(c => c.cropName).join(", ")
      }),
      suggestions: getSuggestions(message, lang)
    };
  }

  // Default response with localization
  return {
    reply: tLocale(lang, 'chat_default', {
      input: input.message,
      crop: tLocale(lang, crop, {}),
      region: tLocale(lang, region, {})
    }),
    suggestions: getSuggestions(message, lang),
  };
}

function getSuggestions(message: string, lang?: string): string[] {
  if (lang === 'hi') {
    if (/disease|blight|rog/i.test(message)) return ["कीट जोखिम के बारे में क्या?", "मैं कितना लाभ कमा सकता हूँ?", "क्या मुझे अभी स्प्रे करना चाहिए?"];
    if (/profit|earn|money/i.test(message)) return ["क्या मुझे बेचना चाहिए या स्टोर करना चाहिए?", "कौन सी फसलें सबसे अच्छा लाभ देती हैं?", "इनपुट लागत क्या हैं?"];
    if (/sell|store|price/i.test(message)) return ["रोग का जोखिम क्या है?", "मेरी फसल को कितने पानी की आवश्यकता है?", "किन फसलों से बचना चाहिए?"];
    if (/water|irrigat/i.test(message)) return ["कीटों का जोखिम क्या है?", "मुझे रोग जोखिम के बारे में बताएं", "कितना लाभ अपेक्षित है?"];
    return ["रोग जोखिम के बारे में बताएं", "प्रति एकड़ कितना लाभ?", "क्या मुझे अभी बेचना चाहिए?", "किन फसलों से बचना चाहिए?"];
  }
  if (lang === 'or') {
    if (/disease|blight|rog/i.test(message)) return ["ପୋକ ଆଶଙ୍କା ବିଷୟରେ କ’ଣ?", "ମୁଁ କେତେ ଲାଭ କରିପାରିବି?", "ମୁଁ ଏବେ ସ୍ପ୍ରେ କରିବି କି?"];
    if (/profit|earn|money/i.test(message)) return ["ମୁଁ ବିକ୍ରି କରିବି କି ସଂରକ୍ଷଣ କରିବି?", "କେଉଁ ଫସଲ ଭଲ ଲାଭ ଦିଏ?", "ଖର୍ଚ୍ଚ କେତେ ହେବ?"];
    if (/sell|store|price/i.test(message)) return ["ରୋଗ ଆଶଙ୍କା କ’ଣ?", "ମୋ ଫସଲ ପାଇଁ କେତେ ପାଣି ଦରକାର?", "କେଉଁ ଫସଲ ଚାଷ କରିବା ଅନୁଚିତ?"];
    if (/water|irrigat/i.test(message)) return ["ପୋକ ଆଶଙ୍କା କ’ଣ?", "ରୋଗ ଆଶଙ୍କା ବିଷୟରେ କୁହନ୍ତୁ", "କେତେ ଲାଭ ହେବ?"];
    return ["ରୋଗ ଆଶଙ୍କା ବିଷୟରେ କୁହନ୍ତୁ", "ଏକର ପିଛା କେତେ ଲାଭ?", "ମୁଁ ଏବେ ବିକ୍ରି କରିବି କି?", "କେଉଁ ଫସଲ ଚାଷ କରିବା ଅନୁଚିତ?"];
  }

  if (/disease|blight|rog/i.test(message)) return ["What about pest risk?", "How much profit can I make?", "Should I spray now?"];
  if (/profit|earn|money/i.test(message)) return ["Should I sell or store?", "What crops give best profit?", "What are input costs?"];
  if (/sell|store|price/i.test(message)) return ["What's the disease risk?", "How much water does my crop need?", "What crops to avoid?"];
  if (/water|irrigat/i.test(message)) return ["What's the pest risk?", "Tell me about disease risk", "How much profit expected?"];
  return ["Tell me about disease risk", "How much profit per acre?", "Should I sell now?", "What crops to avoid?"];
}
