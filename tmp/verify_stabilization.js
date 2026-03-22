
import { simulateRiskAdvisory, simulatePriceForecast } from '../src/lib/ai-engine';

async function verify() {
  try {
    console.log("=== VERIFYING INTERCROPPING ===");
    const kharifResult = simulateRiskAdvisory({ region: "Punjab", cropType: "Rice", season: "Kharif", language: "en" });
    console.log("Kharif (Rice) Combinations:", JSON.stringify(kharifResult.recommendedCombinations, null, 2));

    const rabiResult = simulateRiskAdvisory({ region: "Punjab", cropType: "Wheat", season: "Rabi", language: "en" });
    console.log("Rabi (Wheat) Combinations:", JSON.stringify(rabiResult.recommendedCombinations, null, 2));

    console.log("\n=== VERIFYING STORAGE LOGIC ===");
    // Test case where storage is profitable
    const storeResult = simulatePriceForecast({ 
      cropName: "Wheat", 
      currentPrice: 2000, 
      quantityQuintals: 100, 
      storageCostPerDay: 1, 
      language: "en" 
    }, "seed-123"); 
  
    console.log("Decision:", storeResult.decision);
    console.log("Net Gain/Loss:", storeResult.expectedGainLoss);
    console.log("Reasoning snippet:", storeResult.reasoning.substring(0, 100));
    console.log("Alternative Reasoning:", storeResult.alternativeReasoning);
  } catch (err) {
    console.error("VERIFICATION FAILED:", err);
    process.exit(1);
  }
}

verify();
