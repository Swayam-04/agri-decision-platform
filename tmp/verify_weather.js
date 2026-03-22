
import { getLiveWeather } from '../src/lib/weather-service';

async function verify() {
  console.log("=== VERIFYING ROBUST WEATHER FALLBACK ===");
  
  // Test with invalid region to trigger fallback
  const fallbackResult = await getLiveWeather("INVALID_REGION");
  console.log("Result:", JSON.stringify(fallbackResult, null, 2));

  if (fallbackResult.temp === 30 && fallbackResult.humidity === 70 && fallbackResult.rainfall === 10) {
    console.log("✅ SUCCESS: Fallback values match spec (30, 70, 10)");
  } else {
    console.error("❌ FAILED: Fallback values do not match spec!");
    process.exit(1);
  }
}

verify().catch(console.error);
