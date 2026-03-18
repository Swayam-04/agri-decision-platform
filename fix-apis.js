const fs = require("fs");
const path = require("path");

const apiDir = path.join(__dirname, "src", "app", "api");
const targets = [
  "sms-alerts",
  "risk-advisory",
  "profit-predict",
  "price-forecast",
  "pest-outbreak",
  "irrigation",
  "disease-risk",
  "chatbot"
];

for (const t of targets) {
  const file = path.join(apiDir, t, "route.ts");
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, "utf8");

    // Replace literal "\n" injection
    code = code.replace(
      'const language = req.headers.get("x-language") || "en";\\n    const body = await req.json();\\n    body.language = language;',
      'const language = req.headers.get("x-language") || "en";\n    const body = await req.json();\n    body.language = language;'
    );

    // Replace duplicate language inputs created by script
    code = code.replace(/, language , language/g, ", language");

    fs.writeFileSync(file, code);
    console.log(`✅ Fixed syntax in ${t}/route.ts`);
  }
}
