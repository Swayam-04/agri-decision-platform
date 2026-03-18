import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are KisanBot, an AI farming assistant.
Answer only crop-related questions.
Reply in the same language the farmer used.
Keep answers short, simple, and practical.`;

function extractGroqText(data: any): string {
  try {
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) {
      return content
        .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
        .filter(Boolean)
        .join("\n")
        .trim();
    }
  } catch {
    // ignore
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY environment variable" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const text = String(body?.text ?? "").trim();
    const lang = String(body?.lang ?? "en-IN");
    const languageLabel = String(body?.languageLabel ?? "");

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const userContent =
      `Farmer language: ${languageLabel || lang}\n` +
      `If the question is not about crops/farming, refuse briefly.\n\n` +
      `Question: ${text}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 300,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => "");
      return NextResponse.json(
        { error: "Groq API error", details: errText || groqRes.statusText },
        { status: 502 },
      );
    }

    const data = await groqRes.json();
    const reply = extractGroqText(data) || "Sorry, I couldn’t generate an answer.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Voice assistant failed to respond" }, { status: 500 });
  }
}

