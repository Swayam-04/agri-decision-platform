import { NextRequest, NextResponse } from "next/server";
import { simulatePriceForecast } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, region, currentPrice, quantityQuintals, storageCostPerDay } = body;

    if (!cropType || !region || !currentPrice || !quantityQuintals || !storageCostPerDay) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 600));

    const result = simulatePriceForecast({ cropType, region, currentPrice, quantityQuintals, storageCostPerDay });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to forecast price" }, { status: 500 });
  }
}
