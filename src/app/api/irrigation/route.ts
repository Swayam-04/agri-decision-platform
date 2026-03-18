import { NextRequest, NextResponse } from "next/server";
import { simulateIrrigation } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const language = req.headers.get("x-language") || "en";
    const body = await req.json();
    body.language = language;
    const { cropType, region, soilType, temperature, humidity, recentRainfall, season } = body;

    if (!cropType || !region || !soilType || temperature == null || humidity == null || recentRainfall == null || !season) {
      return NextResponse.json({ error: "All fields required: cropType, region, soilType, temperature, humidity, recentRainfall, season" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 500));
    const result = simulateIrrigation({ cropType, region, soilType, temperature, humidity, recentRainfall, season , language });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to simulate irrigation" }, { status: 500 });
  }
}
