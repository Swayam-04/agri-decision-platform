async function test() {
  // Test Irrigation API
  const irr = await fetch("http://localhost:3000/api/irrigation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cropType: "Rice", region: "Punjab", soilType: "Alluvial", temperature: 32, humidity: 65, recentRainfall: 5, season: "Kharif" }),
  });
  console.log("=== IRRIGATION ===");
  console.log(JSON.stringify(await irr.json(), null, 2));

  // Test Pest Outbreak API
  const pest = await fetch("http://localhost:3000/api/pest-outbreak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ region: "Maharashtra", season: "Kharif", temperature: 30, humidity: 78, recentRainfall: 25 }),
  });
  console.log("\n=== PEST OUTBREAK ===");
  const pestData = await pest.json();
  console.log(`Probability: ${pestData.outbreakProbability}%, Zone: ${pestData.riskZone}`);
  console.log(`Affected crops: ${pestData.affectedCrops?.length}, District alerts: ${pestData.districtAlerts?.length}`);

  // Test SMS Alerts API
  const sms = await fetch("http://localhost:3000/api/sms-alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cropType: "Tomato", region: "Karnataka", season: "Kharif" }),
  });
  console.log("\n=== SMS ALERTS ===");
  const smsData = await sms.json();
  console.log(`Total: ${smsData.totalSent}, Critical: ${smsData.criticalCount}`);
  smsData.alerts?.forEach(a => console.log(`  [${a.priority}] ${a.message}`));

  // Test Chatbot API
  const chat = await fetch("http://localhost:3000/api/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "What diseases affect my crop?", cropType: "Rice", region: "Punjab", season: "Kharif" }),
  });
  console.log("\n=== CHATBOT ===");
  const chatData = await chat.json();
  console.log(chatData.reply.substring(0, 200) + "...");
  console.log("Suggestions:", chatData.suggestions);
}
test().catch(console.error);
