import { NextRequest, NextResponse } from "next/server";
import { triggerEventAlerts } from "@/lib/sms-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, region, season, farmerPhone, temperature, humidity, recentRainfall, soilType } = body;

    if (!cropType || !region || !season || !farmerPhone) {
      return NextResponse.json(
        { error: "Required fields: cropType, region, season, farmerPhone" },
        { status: 400 }
      );
    }

    const result = await triggerEventAlerts({
      cropType,
      region,
      season,
      farmerPhone,
      temperature,
      humidity,
      recentRainfall,
      soilType,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to evaluate triggers" }, { status: 500 });
  }
}
