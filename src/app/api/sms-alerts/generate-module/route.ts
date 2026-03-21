import { NextRequest, NextResponse } from "next/server";
import { generateModuleAlert } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activeModule, cropType, region, season, temperature, humidity, rainfall } = body;
    const lang = req.headers.get("x-language") || "en";

    if (!activeModule || !cropType || !region || !season) {
      return NextResponse.json(
        { error: "Missing required fields (activeModule, cropType, region, season)" },
        { status: 400 }
      );
    }

    const message = await generateModuleAlert({
      activeModule,
      cropType,
      region,
      season,
      language: lang,
      temperature,
      humidity,
      rainfall,
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error("[GenerateModuleAlert API Error]", error);
    return NextResponse.json(
      { error: "Failed to generate module alert" },
      { status: 500 }
    );
  }
}
