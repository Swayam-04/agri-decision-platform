import { NextRequest, NextResponse } from "next/server";
import { simulatePestOutbreak } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const language = req.headers.get("x-language") || "en";
    const body = await req.json();
    body.language = language;
    const { region, district, localArea, season, temperature, humidity, recentRainfall } = body;

    if (!region || !district || !localArea || !season || temperature == null || humidity == null || recentRainfall == null) {
      return NextResponse.json({ error: "All fields required: region, district, localArea, season, temperature, humidity, recentRainfall" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 600));
    const result = simulatePestOutbreak({ region, district, localArea, season, temperature, humidity, recentRainfall , language });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to forecast pest outbreak" }, { status: 500 });
  }
}
