import { NextRequest, NextResponse } from "next/server";
import { simulateChatbot } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const language = req.headers.get("x-language") || "en";
    const body = await req.json();
    body.language = language;
    const { message, cropType, region, season, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await new Promise((r) => setTimeout(r, 300));
    const result = simulateChatbot({ message, cropType, region, season, history , language });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Chatbot failed to respond" }, { status: 500 });
  }
}
