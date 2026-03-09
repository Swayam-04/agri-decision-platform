import { NextRequest, NextResponse } from "next/server";
import { sendSmsAlert } from "@/lib/sms-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message, priority, triggerEvent, cropType, region, season } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Required fields: phone, message" },
        { status: 400 }
      );
    }

    const result = await sendSmsAlert({
      phone,
      message,
      priority,
      triggerEvent,
      cropType,
      region,
      season,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch {
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
