import { NextRequest, NextResponse } from "next/server";
import { getAlertHistory } from "@/lib/sms-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      phone: searchParams.get("phone") || undefined,
      status: (searchParams.get("status") as "queued" | "sent" | "delivered" | "failed" | "retrying") || undefined,
      priority: (searchParams.get("priority") as "Normal" | "High" | "Critical") || undefined,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    };

    const result = getAlertHistory(query);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch alert history" }, { status: 500 });
  }
}
