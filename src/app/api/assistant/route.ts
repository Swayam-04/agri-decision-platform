import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are CropIntel AI (previously KisanBot), an advanced AI farming assistant.
CRITICAL: You MUST answer ONLY agriculture and farming-related questions. If the user asks about ANY other topic (sports, politics, general knowledge, etc.), politely refuse and ask them to ask a farming-related question.
CRITICAL: Reply in the EXACT same language the farmer used in their prompt.
CRITICAL: Output valid JSON ONLY. No markdown wrapping like \`\`\`json. Just the raw JSON object.

1. ALWAYS return your entire response as a JSON object exactly adhering to this structure:
{
  "reply": "The detailed, sophisticated response containing high-quality agriculture info...",
  "voice_reply": "A synthesized, concise version suitable for speaking...",
  "sources": [
    {
      "name": "Organization Name (e.g., ICAR, FAO)",
      "url": "Exactly accurate, real website URL (e.g., https://icar.org.in/)"
    }
  ]
}

- For \`sources\`, you MUST provide exact and accurate real website URLs. Do NOT use fake or dummy URLs. If you specify a source, give its real homepage or the exact document URL.
`;

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
    const lang = String(body?.lang ?? "hi-IN");
    const languageLabel = String(body?.languageLabel ?? "");

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const userContent =
      `Farmer language: ${languageLabel || lang}\n` +
      `Question: ${text}`;

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1500,
        temperature: 0.3,
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
    let content = data?.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response content");
    }

    let parsed = null;
    // Strip markdown formatting if the model incorrectly wrapped the JSON
    const cleanContent = content.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    try {
      parsed = JSON.parse(cleanContent);
    } catch {
      // Fallback: try to extract the first { ... } block
      try {
        const match = cleanContent.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch {
        // Last resort fallback
        parsed = {
          reply: content,
          voice_reply: content.substring(0, 150) + "...",
          sources: [{ name: "Agricultural Extension Services", url: "https://www.manage.gov.in/" }]
        };
      }
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Assistant API Error:", error);
    return NextResponse.json({ error: "Voice assistant failed to respond" }, { status: 500 });
  }
}
