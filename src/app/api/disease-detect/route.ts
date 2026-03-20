import { NextRequest, NextResponse } from "next/server";
import { simulateDiseaseDetection } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const language = req.headers.get("x-language") || "en";
    const body = await req.json();
    const { cropType, imageBase64 } = body;

    if (!cropType || !imageBase64) {
      return NextResponse.json({ error: "cropType and imageBase64 are required" }, { status: 400 });
    }

    // Simulate processing delay for realism
    await new Promise((r) => setTimeout(r, 1200));

    const result = simulateDiseaseDetection(cropType, language);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
