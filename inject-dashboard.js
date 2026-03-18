const fs = require("fs");
const path = require("path");

const enPath = path.join(__dirname, "src", "translations", "en.json");
const hiPath = path.join(__dirname, "src", "translations", "hi.json");
const orPath = path.join(__dirname, "src", "translations", "or.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const hi = JSON.parse(fs.readFileSync(hiPath, "utf8"));
const or = JSON.parse(fs.readFileSync(orPath, "utf8"));

const newEn = {
  "dashboard.analyzing": "Analyzing...",
  "dashboard.diseaseRisk": "Disease Risk",
  "dashboard.nextDays": "next {days} days",
  "dashboard.details": "Details",
  "dashboard.profitEstimate": "Profit Estimate",
  "dashboard.perAcre": "per acre",
  "dashboard.range": "Range",
  "dashboard.costBreakdown": "Cost breakdown",
  "dashboard.sellStore": "Sell / Store",
  "dashboard.storeDays": "Store {days} days",
  "dashboard.sellNow": "Sell now",
  "dashboard.trend": "Trend",
  "dashboard.gain": "Gain",
  "dashboard.loss": "Loss",
  "dashboard.priceTimeline": "Price timeline",
  "dashboard.irrigation": "Irrigation",
  "dashboard.moisture": "Moisture",
  "dashboard.pump": "Pump",
  "dashboard.saved": "Saved",
  "dashboard.fullSchedule": "Full schedule",
  "dashboard.pestOutbreak": "Pest Outbreak",
  "dashboard.outbreakProbability": "outbreak probability",
  "dashboard.districtAlerts": "District alerts",
  "dashboard.smsAlerts": "SMS Alerts",
  "dashboard.sent": "sent",
  "dashboard.critical": "critical",
  "dashboard.alertsTriggered": "alerts triggered",
  "dashboard.allAlerts": "All alerts",
  "dashboard.cropsToAvoid": "Crops to Avoid This Season",
  "dashboard.safe": "Safe:",
  "dashboard.aboutPlatform": "About This Platform",
  "dashboard.aboutDesc": "CropIntel AI uses simulated ML models (CNN, LSTM, XGBoost, Random Forest) for decision intelligence. Includes disease detection, risk forecasting, profit prediction, irrigation optimization, pest outbreak forecasting, SMS alerts, and an AI chatbot assistant. All predictions include confidence scores and uncertainty ranges.",
  "dashboard.riskLow": "Low Risk",
  "dashboard.riskMedium": "Medium Risk",
  "dashboard.riskHigh": "High Risk"
};

const newHi = {
  "dashboard.analyzing": "विश्लेषण कर रहा है...",
  "dashboard.diseaseRisk": "रोग का जोखिम",
  "dashboard.nextDays": "अगले {days} दिन",
  "dashboard.details": "विवरण",
  "dashboard.profitEstimate": "लाभ अनुमान",
  "dashboard.perAcre": "प्रति एकड़",
  "dashboard.range": "सीमा",
  "dashboard.costBreakdown": "लागत विवरण",
  "dashboard.sellStore": "बेचें / भंडारण",
  "dashboard.storeDays": "{days} दिन भंडारण करें",
  "dashboard.sellNow": "अभी बेचें",
  "dashboard.trend": "प्रवृत्ति",
  "dashboard.gain": "लाभ",
  "dashboard.loss": "हानि",
  "dashboard.priceTimeline": "मूल्य समयरेखा",
  "dashboard.irrigation": "सिंचाई",
  "dashboard.moisture": "नमी",
  "dashboard.pump": "पंप",
  "dashboard.saved": "बचत",
  "dashboard.fullSchedule": "पूरा कार्यक्रम",
  "dashboard.pestOutbreak": "कीट प्रकोप",
  "dashboard.outbreakProbability": "प्रकोप की संभावना",
  "dashboard.districtAlerts": "जिला अलर्ट",
  "dashboard.smsAlerts": "SMS अलर्ट",
  "dashboard.sent": "भेजे गए",
  "dashboard.critical": "गंभीर",
  "dashboard.alertsTriggered": "अलर्ट ट्रिगर हुए",
  "dashboard.allAlerts": "सभी अलर्ट",
  "dashboard.cropsToAvoid": "इस मौसम में बचने लायक फसलें",
  "dashboard.safe": "सुरक्षित:",
  "dashboard.aboutPlatform": "इस प्लेटफॉर्म के बारे में",
  "dashboard.aboutDesc": "CropIntel AI निर्णय बुद्धिमत्ता के लिए सिम्युलेटेड ML मॉडल (CNN, LSTM, XGBoost, रैंडम फ़ॉरेस्ट) का उपयोग करता है। इसमें रोग का पता लगाना, जोखिम पूर्वानुमान, लाभ भविष्यवाणी, सिंचाई अनुकूलन, कीट प्रकोप पूर्वानुमान, एसएमएस अलर्ट और एक एआई चैटबॉट सहायक शामिल हैं। सभी भविष्यवाणियों में आत्मविश्वास स्कोर और अनिश्चितता सीमाएं शामिल हैं।",
  "dashboard.riskLow": "कम जोखिम",
  "dashboard.riskMedium": "मध्यम जोखिम",
  "dashboard.riskHigh": "उच्च जोखिम"
};

const newOr = {
  "dashboard.analyzing": "ବିଶ୍ଳେଷଣ କରୁଛି...",
  "dashboard.diseaseRisk": "ରୋଗ ଆଶଙ୍କା",
  "dashboard.nextDays": "ଆଗାମୀ {days} ଦିନ",
  "dashboard.details": "ବିବରଣୀ",
  "dashboard.profitEstimate": "ଲାଭ ଅନୁମାନ",
  "dashboard.perAcre": "ଏକର ପ୍ରତି",
  "dashboard.range": "ପରିସର",
  "dashboard.costBreakdown": "ମୂଲ୍ୟ ବିବରଣୀ",
  "dashboard.sellStore": "ବିକ୍ରୟ / ଭଣ୍ଡାରଣ",
  "dashboard.storeDays": "{days} ଦିନ ଭଣ୍ଡାରଣ କରନ୍ତୁ",
  "dashboard.sellNow": "ବର୍ତ୍ତମାନ ବିକ୍ରି କରନ୍ତୁ",
  "dashboard.trend": "ଧାରା",
  "dashboard.gain": "ଲାଭ",
  "dashboard.loss": "କ୍ଷତି",
  "dashboard.priceTimeline": "ମୂଲ୍ୟ ସମୟରେଖା",
  "dashboard.irrigation": "ଜଳସେଚନ",
  "dashboard.moisture": "ଆର୍ଦ୍ରତା",
  "dashboard.pump": "ପମ୍ପ",
  "dashboard.saved": "ସଞ୍ଚିତ",
  "dashboard.fullSchedule": "ସମ୍ପୂର୍ଣ୍ଣ କାର୍ଯ୍ୟସୂଚୀ",
  "dashboard.pestOutbreak": "କୀଟ ପ୍ରକୋପ",
  "dashboard.outbreakProbability": "ପ୍ରକୋପ ସମ୍ଭାବନା",
  "dashboard.districtAlerts": "ଜିଲ୍ଲା ସତର୍କତା",
  "dashboard.smsAlerts": "SMS ସତର୍କତା",
  "dashboard.sent": "ପଠାଯାଇଛି",
  "dashboard.critical": "ଗୁରୁତର",
  "dashboard.alertsTriggered": "ସତର୍କତା ଟ୍ରିଗର ହୋଇଛି",
  "dashboard.allAlerts": "ସମସ୍ତ ସତର୍କତା",
  "dashboard.cropsToAvoid": "ଏହି ଋତୁରେ ଏଡ଼ାଇବାକୁ ଥିବା ଫସଲ",
  "dashboard.safe": "ସୁରକ୍ଷିତ:",
  "dashboard.aboutPlatform": "ଏହି ପ୍ଲାଟଫର୍ମ ବିଷୟରେ",
  "dashboard.aboutDesc": "ନିଷ୍ପତ୍ତି ବୁଦ୍ଧିମତା ପାଇଁ CropIntel AI ଅନୁକରଣିତ ML ମଡେଲ୍ (CNN, LSTM, XGBoost, Random Forest) ବ୍ୟବହାର କରେ। ରୋଗ ଚିହ୍ନଟ, ବିପଦ ପୂର୍ବାନୁମାନ, ଲାଭ ପୂର୍ବାନୁମାନ, ଜଳସେଚନ ଅପ୍ଟିମାଇଜେସନ୍, କୀଟନାଶକ ପୂର୍ବାନୁମାନ, SMS ସତର୍କତା ଏବଂ ଏକ AI ଚାଟବଟ୍ ସହାୟକ ଅନ୍ତର୍ଭୁକ୍ତ। ସମସ୍ତ ପୂର୍ବାନୁମାନରେ ଆତ୍ମବିଶ୍ୱାସ ସ୍କୋର ଏବଂ ଅନିଶ୍ଚିତତା ପରିସର ଅନ୍ତର୍ଭୁକ୍ତ।",
  "dashboard.riskLow": "କମ୍ ଆଶଙ୍କା",
  "dashboard.riskMedium": "ମଧ୍ୟମ ଆଶଙ୍କା",
  "dashboard.riskHigh": "ଉଚ୍ଚ ଆଶଙ୍କା"
};

Object.assign(en, newEn);
Object.assign(hi, newHi);
Object.assign(or, newOr);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2));
fs.writeFileSync(orPath, JSON.stringify(or, null, 2));

console.log("Translations injected for dashboard");
