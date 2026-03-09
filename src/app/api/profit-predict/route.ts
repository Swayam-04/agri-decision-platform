import { NextRequest, NextResponse } from "next/server";
import { simulateProfitPrediction } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, region, acreage, season, irrigationType, soilType } = body;

    if (!cropType || !region || !acreage || !season || !irrigationType || !soilType) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 700));

    const result = simulateProfitPrediction({ cropType, region, acreage, season, irrigationType, soilType });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to predict profit" }, { status: 500 });
  }
}
