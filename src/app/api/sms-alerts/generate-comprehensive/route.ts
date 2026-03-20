import { NextRequest, NextResponse } from "next/server";
import { generateDetailedAlert } from "@/lib/ai-engine";

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

    const { rich, compact } = await generateDetailedAlert({
      cropType,
      region,
      season,
      language: lang,
    });

    return NextResponse.json({ rich, compact });
  } catch (error: any) {
    console.error("[GenerateComprehensive AI Alert API Error]", error);
    return NextResponse.json(
      { error: "Failed to generate comprehensive alert" },
      { status: 500 }
    );
  }
}
