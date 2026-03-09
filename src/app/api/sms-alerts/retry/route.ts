import { NextResponse } from "next/server";
import { retryFailedMessages } from "@/lib/sms-engine";

export async function POST() {
  try {
    const result = await retryFailedMessages();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to retry messages" }, { status: 500 });
  }
}
