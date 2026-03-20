import { NextRequest, NextResponse } from "next/server";
import { simulatePriceForecast } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const language = req.headers.get("x-language") || "en";
    const body = await req.json();
    body.language = language;
    const { cropType, cropTypes, region, currentPrice, currentPrices, quantityQuintals, storageCostPerDay } = body;

    const hasCrop = cropType || (cropTypes && cropTypes.length > 0);
    const hasPrice = currentPrice || (currentPrices && Object.keys(currentPrices).length > 0);

    if (!hasCrop || !region || !hasPrice || !quantityQuintals || !storageCostPerDay) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 600));

    const result = simulatePriceForecast({ cropType, cropTypes, region, currentPrice, currentPrices, quantityQuintals, storageCostPerDay, language });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to forecast price" }, { status: 500 });
  }
}
