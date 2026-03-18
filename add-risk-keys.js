const fs = require('fs');
const path = require('path');

const newKeysBase = {
  "advisory.pageTitle": "Crop Risk Advisory",
  "advisory.pageSubtitle": "Find out which crops to avoid for your region and season. Transparent risk scoring with clear explanations - no black-box outputs.",
  "advisory.regionLabel": "Region",
  "advisory.seasonLabel": "Season",
  "advisory.getButton": "Get Risk Advisory",
  "advisory.analyzing": "Analyzing...",
  "advisory.seasonalInsight": "Seasonal Insight",
  "advisory.cropsToAvoid": "Crops to Avoid in",
  "advisory.seasonSuffix": "Season",
  "advisory.diseaseRisk": "Disease Risk",
  "advisory.profitVolatility": "Profit Volatility",
  "advisory.climateMismatch": "Climate Mismatch",
  "advisory.whyToAvoid": "Why to avoid:",
  "advisory.recommendedCrops": "Recommended Crops for",
  "advisory.risk.Low": "Low Risk",
  "advisory.risk.Medium": "Medium Risk",
  "advisory.risk.High": "High Risk",
  "advisory.risk.Very High": "Very High Risk"
};

const orTranslations = {
  "advisory.pageTitle": "ଫସଲ ବିପଦ ପରାମର୍ଶ",
  "advisory.pageSubtitle": "ଆପଣଙ୍କ ଅଞ୍ଚଳ ଏବଂ ଋତୁ ପାଇଁ କେଉଁ ଫସଲରୁ ଦୂରେଇ ରହିବେ ତାହା ଖୋଜନ୍ତୁ। ସ୍ୱଚ୍ଛ ବିପଦ ସ୍କୋରିଂ ସହିତ ସ୍ପଷ୍ଟ ବ୍ୟାଖ୍ୟା - କୌଣସି ବ୍ଲାକ୍-ବକ୍ସ ଆଉଟପୁଟ୍ ନାହିଁ।",
  "advisory.regionLabel": "ଅଞ୍ଚଳ",
  "advisory.seasonLabel": "ଋତୁ",
  "advisory.getButton": "ବିପଦ ପରାମର୍ଶ ପାଆନ୍ତୁ",
  "advisory.analyzing": "ବିଶ୍ଳେଷଣ କରୁଛି...",
  "advisory.seasonalInsight": "ଋତୁକାଳୀନ ଅନ୍ତର୍ଦୃଷ୍ଟି",
  "advisory.cropsToAvoid": "ଦୂରେଇ ରହିବାକୁ ଥିବା ଫସଲ (",
  "advisory.seasonSuffix": "ଋତୁ)",
  "advisory.diseaseRisk": "ରୋଗର ବିପଦ",
  "advisory.profitVolatility": "ଲାଭର ଅସ୍ଥିରତା",
  "advisory.climateMismatch": "ଜଳବାୟୁର ଅସମାନତା",
  "advisory.whyToAvoid": "କାହିଁକି ଦୂରେଇ ରହିବେ:",
  "advisory.recommendedCrops": "ପାଇଁ ସୁପାରିଶ କରାଯାଇଥିବା ଫସଲ (",
  "advisory.risk.Low": "କମ୍ ବିପଦ",
  "advisory.risk.Medium": "ମଧ୍ୟମ ବିପଦ",
  "advisory.risk.High": "ଉଚ୍ଚ ବିପଦ",
  "advisory.risk.Very High": "ଅଧିକ ଉଚ୍ଚ ବିପଦ"
};

const hiTranslations = {
  "advisory.pageTitle": "फसल जोखिम सलाह",
  "advisory.pageSubtitle": "पता करें कि आपके क्षेत्र और मौसम के लिए किन फसलों से बचना चाहिए। स्पष्ट व्याख्याओं के साथ पारदर्शी जोखिम स्कोरिंग - कोई ब्लैक-बॉक्स आउटपुट नहीं।",
  "advisory.regionLabel": "क्षेत्र",
  "advisory.seasonLabel": "मौसम",
  "advisory.getButton": "जोखिम सलाह प्राप्त करें",
  "advisory.analyzing": "विश्लेषण हो रहा है...",
  "advisory.seasonalInsight": "मौसमी अंतर्दृष्टि",
  "advisory.cropsToAvoid": "में बचने के लिए फसलें (",
  "advisory.seasonSuffix": "मौसम)",
  "advisory.diseaseRisk": "रोग का खतरा",
  "advisory.profitVolatility": "लाभ अस्थिरता",
  "advisory.climateMismatch": "जलवायु बेमेल",
  "advisory.whyToAvoid": "क्यों बचें:",
  "advisory.recommendedCrops": "के लिए अनुशंसित फसलें (",
  "advisory.risk.Low": "कम जोखिम",
  "advisory.risk.Medium": "मध्यम जोखिम",
  "advisory.risk.High": "उच्च जोखिम",
  "advisory.risk.Very High": "बहुत उच्च जोखिम"
};

const langs = [
  { code: 'en', extra: newKeysBase },
  { code: 'hi', extra: hiTranslations },
  { code: 'or', extra: orTranslations }
];

langs.forEach(lang => {
  const p = path.join(__dirname, 'src', 'translations', `${lang.code}.json`);
  let data = {};
  if (fs.existsSync(p)) {
    data = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  data = { ...data, ...lang.extra };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
