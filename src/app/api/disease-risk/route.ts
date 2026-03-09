import { NextRequest, NextResponse } from "next/server";
import { simulateDiseaseRisk } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, region, temperature, humidity, rainfall, season } = body;

    if (!cropType || !region || temperature == null || humidity == null || rainfall == null || !season) {
      return NextResponse.json({ error: "All fields are required: cropType, region, temperature, humidity, rainfall, season" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 600));

    const result = simulateDiseaseRisk({ cropType, region, temperature, humidity, rainfall, season });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to forecast disease risk" }, { status: 500 });
  }
}
