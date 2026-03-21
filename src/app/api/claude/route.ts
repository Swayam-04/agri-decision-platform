import { NextRequest, NextResponse } from "next/server";
import { detectTopic, getSources, formatVoiceSources } from "@/lib/source-service";

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
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    // Default to OpenAI if key provided, else Groq
    const useOpenAI = !!openaiKey;
    const apiKey = useOpenAI ? openaiKey : groqKey;
    const apiUrl = useOpenAI ? "https://api.openai.com/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
    const model = useOpenAI ? "gpt-4o-mini" : "llama-3.3-70b-versatile";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY or OPENAI_API_KEY environment variable" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const text = String(body?.text ?? "").trim();
    const lang = String(body?.lang ?? "hi-IN"); // testing default
    const languageLabel = String(body?.languageLabel ?? "");

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const userContent =
      `Farmer language: ${languageLabel || lang}\n` +
      `If the question is not about crops/farming, refuse briefly.\n\n` +
      `Question: ${text}`;

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 300,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text().catch(() => "");
      return NextResponse.json(
        { error: "API error", details: errText || apiRes.statusText },
        { status: 502 },
      );
    }

    const data = await apiRes.json();
    const replyText = extractGroqText(data) || "Sorry, I couldn’t generate an answer.";
    
    // Add sourcing for voice assistant
    const topic = detectTopic(text);
    const sources = getSources(topic);
    const sourceVoice = formatVoiceSources(sources);
    
    const reply = replyText + sourceVoice;
    
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Voice assistant failed to respond" }, { status: 500 });
  }
}

