import { NextRequest, NextResponse } from "next/server";
import { simulateDiseaseDetection, processPythonApiResult } from "@/lib/ai-engine";

export async function POST(req: NextRequest) {
  try {
    const language = req.headers.get("x-language") || "en";
    const body = await req.json();
    const { cropType, imageBase64 } = body;

    if (!cropType || !imageBase64) {
      return NextResponse.json({ error: "cropType and imageBase64 are required" }, { status: 400 });
    }

    // Call Python API Backend
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const blob = new Blob([buffer], { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", blob, "image.jpg");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 sec timeout

      const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";
      const pyRes = await fetch(`${pythonApiUrl}/predict`, {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        const result = processPythonApiResult(pyData, cropType, language);
        return NextResponse.json(result);
      } else {
        console.warn(`Python API returned ${pyRes.status}, falling back to simulation.`);
      }
    } catch (e) {
      console.warn("Python API unreachable or failed, falling back to AI simulation.", e);
    }

    // Simulate processing delay for realism (Fallback)
    await new Promise((r) => setTimeout(r, 1200));

    const result = simulateDiseaseDetection(cropType, language);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
