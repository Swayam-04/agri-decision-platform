import { NextRequest, NextResponse } from "next/server";
import { simulateSmsAlerts } from "@/lib/ai-engine";
import { getAlertHistory, getGatewayConfig } from "@/lib/sms-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, region, season, farmerPhone, language } = body;

    if (!cropType || !region || !season) {
      return NextResponse.json({ error: "Required fields: cropType, region, season" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 400));
    const simulated = simulateSmsAlerts({ cropType, region, season, farmerPhone, language });

    // Augment with engine status
    const history = getAlertHistory({ limit: 50 });
    const gateway = getGatewayConfig();

    return NextResponse.json({
      ...simulated,
      gateway: `${gateway.provider.toUpperCase()} Gateway (${gateway.provider === "mock" ? "Simulated" : "Live"})`,
      engineStats: history.stats,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate SMS alerts" }, { status: 500 });
  }
}
