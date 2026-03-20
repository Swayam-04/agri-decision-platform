import { NextRequest, NextResponse } from "next/server";
import { generateSmartSms } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cropType, region, season } = body;
    const lang = req.headers.get("x-language") || "en";

    if (!cropType || !region || !season) {
      return NextResponse.json(
        { error: "Missing required fields (cropType, region, season)" },
        { status: 400 }
      );
    }

    const message = await generateSmartSms({
      cropType,
      region,
      season,
      language: lang,
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error("[GenerateSmartSms API Error]", error);
    return NextResponse.json(
      { error: "Failed to generate smart alert" },
      { status: 500 }
    );
  }
}
