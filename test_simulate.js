require('ts-node').register({ transpileOnly: true });
const { simulatePriceForecast } = require('./src/lib/ai-engine.ts');

try {
  const result = simulatePriceForecast({
    cropType: 'Tomato',
    region: 'Maharashtra',
    currentPrice: 500,
    quantityQuintals: 50,
    storageCostPerDay: 8,
    language: 'en'
  });
  console.log("Success!");
  console.log(result.alternativeOptions);
} catch (e) {
  console.error(e);
}
