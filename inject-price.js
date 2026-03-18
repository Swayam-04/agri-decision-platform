const fs = require("fs");
const path = require("path");

const enPath = path.join(__dirname, "src", "translations", "en.json");
const hiPath = path.join(__dirname, "src", "translations", "hi.json");
const orPath = path.join(__dirname, "src", "translations", "or.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const hi = JSON.parse(fs.readFileSync(hiPath, "utf8"));
const or = JSON.parse(fs.readFileSync(orPath, "utf8"));

const newEn = {
  "price.title": "Price Forecast & Sell/Store Decision",
  "price.subtitle": "Should you sell now or store your harvest? AI compares storage cost, spoilage risk, and price trends to decide.",
  "price.marketDetails": "Market Details",
  "price.crop": "Crop",
  "price.region": "Region",
  "price.currentPrice": "Current Market Price (Rs/quintal)",
  "price.quantity": "Quantity (quintals)",
  "price.storageCost": "Storage Cost (Rs/quintal/day)",
  "price.btnForecasting": "Forecasting...",
  "price.btnAdvice": "Get Sell/Store Advice",
  "price.aiDecision": "AI Decision",
  "price.storeFor": "Store for",
  "price.days": "Days",
  "price.sellNow": "Sell Now",
  "price.priceTrend": "Price Trend",
  "price.priceChange": "Price Change",
  "price.storageCostValue": "Storage Cost",
  "price.spoilageRisk_label": "Spoilage Risk",
  "price.rising": "Rising",
  "price.falling": "Falling",
  "price.stable": "Stable",
  "price.riskLow": "Low",
  "price.riskMedium": "Medium",
  "price.riskHigh": "High",
  "price.30dayForecast": "30-Day Price Forecast",
  "price.financialSummary": "Financial Summary",
  "price.currentValue": "Current Value",
  "price.forecastedValue": "Forecasted Value",
  "price.netGain": "Net Gain",
  "price.netLoss": "Net Loss",
  "price.aiReasoning": "AI Reasoning",
  "price.spoilageWarning": "Spoilage Warning",
  "price.spoilageMsg": "is a perishable crop. Extended storage increases spoilage risk. Ensure proper cold storage or ventilated warehousing to minimize losses.",
  "price.daysChart": "Days",
  "price.priceChart": "Rs/quintal",
  "price.current": "Current",
  "price.sellDay": "Sell Day"
};

const newHi = {
  "price.title": "मूल्य पूर्वानुमान और बेचें/भंडारण निर्णय",
  "price.subtitle": "क्या आपको अभी बेचना चाहिए या अपनी फसल का भंडारण करना चाहिए? AI निर्णय लेने के लिए भंडारण लागत, खराब होने के जोखिम और मूल्य प्रवृत्तियों की तुलना करता है।",
  "price.marketDetails": "बाजार विवरण",
  "price.crop": "फसल",
  "price.region": "क्षेत्र",
  "price.currentPrice": "वर्तमान बाजार मूल्य (रु/क्विंटल)",
  "price.quantity": "मात्रा (क्विंटल)",
  "price.storageCost": "भंडारण लागत (रु/क्विंटल/दिन)",
  "price.btnForecasting": "पूर्वानुमान लगा रहा है...",
  "price.btnAdvice": "बेचें/भंडारण सलाह प्राप्त करें",
  "price.aiDecision": "AI निर्णय",
  "price.storeFor": "भंडारण करें",
  "price.days": "दिनों के लिए",
  "price.sellNow": "अभी बेचें",
  "price.priceTrend": "मूल्य प्रवृत्ति",
  "price.priceChange": "मूल्य परिवर्तन",
  "price.storageCostValue": "भंडारण लागत",
  "price.spoilageRisk_label": "खराब होने का जोखिम",
  "price.rising": "बढ़ रहा है",
  "price.falling": "गिर रहा है",
  "price.stable": "स्थिर",
  "price.riskLow": "कम",
  "price.riskMedium": "मध्यम",
  "price.riskHigh": "उच्च",
  "price.30dayForecast": "30-दिवसीय मूल्य पूर्वानुमान",
  "price.financialSummary": "वित्तीय सारांश",
  "price.currentValue": "वर्तमान मूल्य",
  "price.forecastedValue": "पूर्वानुमानित मूल्य",
  "price.netGain": "शुद्ध लाभ",
  "price.netLoss": "शुद्ध हानि",
  "price.aiReasoning": "AI तर्क",
  "price.spoilageWarning": "खराब होने की चेतावनी",
  "price.spoilageMsg": "एक खराब होने वाली फसल है। लंबे समय तक भंडारण से खराब होने का जोखिम बढ़ जाता है। नुकसान को कम करने के लिए उचित कोल्ड स्टोरेज या हवादार गोदाम सुनिश्चित करें।",
  "price.daysChart": "दिन",
  "price.priceChart": "रु/क्विंटल",
  "price.current": "वर्तमान",
  "price.sellDay": "बिक्री का दिन"
};

const newOr = {
  "price.title": "ମୂଲ୍ୟ ପୂର୍ବାନୁମାନ ଏବଂ ବିକ୍ରୟ/ଭଣ୍ଡାରଣ ନିଷ୍ପତ୍ତି",
  "price.subtitle": "ଆପଣ ବର୍ତ୍ତମାନ ବିକ୍ରି କରିବା ଉଚିତ୍ କିମ୍ବା ଆପଣଙ୍କର ଅମଳକୁ ସଂରକ୍ଷଣ କରିବା ଉଚିତ୍ କି? ନିଷ୍ପତ୍ତି ନେବାକୁ AI ସଂରକ୍ଷଣ ମୂଲ୍ୟ, ନଷ୍ଟ ହେବାର ଆଶଙ୍କା ଏବଂ ମୂଲ୍ୟ ଧାରାକୁ ତୁଳନା କରେ।",
  "price.marketDetails": "ବଜାର ବିବରଣୀ",
  "price.crop": "ଫସଲ",
  "price.region": "ଅଞ୍ଚଳ",
  "price.currentPrice": "ବର୍ତ୍ତମାନର ବଜାର ମୂଲ୍ୟ (ଟଙ୍କା/କ୍ୱିଣ୍ଟାଲ)",
  "price.quantity": "ପରିମାଣ (କ୍ୱିଣ୍ଟାଲ)",
  "price.storageCost": "ସଂରକ୍ଷଣ ମୂଲ୍ୟ (ଟଙ୍କା/କ୍ୱିଣ୍ଟାଲ/ଦିନ)",
  "price.btnForecasting": "ପୂର୍ବାନୁମାନ କରୁଛି...",
  "price.btnAdvice": "ବିକ୍ରୟ/ଭଣ୍ଡାରଣ ପରାମର୍ଶ ପ୍ରାପ୍ତ କରନ୍ତୁ",
  "price.aiDecision": "AI ନିଷ୍ପତ୍ତି",
  "price.storeFor": "ପାଇଁ ସଂରକ୍ଷଣ କରନ୍ତୁ",
  "price.days": "ଦିନ",
  "price.sellNow": "ବର୍ତ୍ତମାନ ବିକ୍ରି କରନ୍ତୁ",
  "price.priceTrend": "ମୂଲ୍ୟ ଧାରା",
  "price.priceChange": "ମୂଲ୍ୟ ପରିବର୍ତ୍ତନ",
  "price.storageCostValue": "ସଂରକ୍ଷଣ ମୂଲ୍ୟ",
  "price.spoilageRisk_label": "ନଷ୍ଟ ହେବାର ଆଶଙ୍କା",
  "price.rising": "ବୃଦ୍ଧି ପାଉଛି",
  "price.falling": "ହ୍ରାସ ପାଉଛି",
  "price.stable": "ସ୍ଥିର",
  "price.riskLow": "କମ୍",
  "price.riskMedium": "ମଧ୍ୟମ",
  "price.riskHigh": "ଉଚ୍ଚ",
  "price.30dayForecast": "30-ଦିନିଆ ମୂଲ୍ୟ ପୂର୍ବାନୁମାନ",
  "price.financialSummary": "ଆର୍ଥିକ ସାରାଂଶ",
  "price.currentValue": "ବର୍ତ୍ତମାନର ମୂଲ୍ୟ",
  "price.forecastedValue": "ପୂର୍ବାନୁମାନିତ ମୂଲ୍ୟ",
  "price.netGain": "ସୁଦ୍ଧ ଲାଭ",
  "price.netLoss": "ସୁଦ୍ଧ କ୍ଷତି",
  "price.aiReasoning": "AI ଯୁକ୍ତି",
  "price.spoilageWarning": "ନଷ୍ଟ ହେବା ଚେତାବନୀ",
  "price.spoilageMsg": "ଏକ ଶୀଘ୍ର ନଷ୍ଟ ହେଉଥିବା ଫସଲ ଅଟେ। ଅଧିକ ସମୟ ସଂରକ୍ଷଣ ଦ୍ୱାରା ନଷ୍ଟ ହେବାର ଆଶଙ୍କା ବଢିଥାଏ। କ୍ଷତି କମାଇବା ପାଇଁ ଉପଯୁକ୍ତ କୋଲ୍ଡ ଷ୍ଟୋରେଜ୍ କିମ୍ବା ବାୟୁ ଚଳାଚଳ ଥିବା ଗୋଦାମ ନିଶ୍ଚିତ କରନ୍ତୁ।",
  "price.daysChart": "ଦିନ",
  "price.priceChart": "ଟଙ୍କା/କ୍ୱିଣ୍ଟାଲ",
  "price.current": "ବର୍ତ୍ତମାନ",
  "price.sellDay": "ବିକ୍ରୟ ଦିନ"
};

Object.assign(en, newEn);
Object.assign(hi, newHi);
Object.assign(or, newOr);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2));
fs.writeFileSync(orPath, JSON.stringify(or, null, 2));

console.log("Translations injected for price forecast");
