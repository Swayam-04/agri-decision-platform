import { NextRequest, NextResponse } from "next/server";
import { simulateRiskAdvisory } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { region, season } = body;

    if (!region || !season) {
      return NextResponse.json({ error: "region and season are required" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 500));

    const result = simulateRiskAdvisory({ region, season });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to generate risk advisory" }, { status: 500 });
  }
}
