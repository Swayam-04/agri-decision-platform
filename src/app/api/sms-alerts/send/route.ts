import { NextRequest, NextResponse } from "next/server";
import { sendSmsAlert } from "@/lib/sms-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message, priority, triggerEvent, gateway, cropType, region, season, useBroadcast } = body;

    if (!message) {
      return NextResponse.json({ error: "Required fields: message" }, { status: 400 });
    }

    if (useBroadcast) {
      if (!cropType || !region) {
        return NextResponse.json({ error: "Broadcasting requires cropType and region" }, { status: 400 });
      }
      
      const { getValidTargetFarmers } = await import("@/lib/farmer-db");
      const targetFarmers = getValidTargetFarmers(cropType, region);
      
      if (targetFarmers.length === 0) {
        return NextResponse.json(
          { success: true, logEntry: { id: "0", phone: "No matches found.", message: "No subscribed farmers match this crop/region string.", status: "delivered", timestamp: new Date().toISOString(), priority: "Normal", triggerEvent: "Database Broadcast", gatewayProvider: "System", maxRetries: 0, retryCount: 0 } }, 
          { status: 200 }
        );
      }

      let lastResult = null;
      for (const farmer of targetFarmers) {
        const result = await sendSmsAlert({
          phone: farmer.phone,
          message,
          priority,
          triggerEvent: triggerEvent || "Database Broadcast",
          gateway,
          cropType,
          region,
          season,
        });
        lastResult = result;
      }
      
      // Return the last result for the UI, with message showing broadcast success
      return NextResponse.json({ ...lastResult, validationErrors: [`Broadcast sent to ${targetFarmers.length} farmers!`] }, { status: 200 });

    } else {
      if (!phone) return NextResponse.json({ error: "Single dispatch requires phone." }, { status: 400 });
      const result = await sendSmsAlert({
        phone,
        message,
        priority,
        triggerEvent,
        gateway,
        cropType,
        region,
        season,
      });

      return NextResponse.json(result, { status: result.success ? 200 : 422 });
    }
  } catch {
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
