import { NextRequest, NextResponse } from "next/server";
import { simulateIrrigation } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, region, soilType, temperature, humidity, recentRainfall, season } = body;

    if (!cropType || !region || !soilType || temperature == null || humidity == null || recentRainfall == null || !season) {
      return NextResponse.json({ error: "All fields required: cropType, region, soilType, temperature, humidity, recentRainfall, season" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 500));
    const result = simulateIrrigation({ cropType, region, soilType, temperature, humidity, recentRainfall, season });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to simulate irrigation" }, { status: 500 });
  }
}
