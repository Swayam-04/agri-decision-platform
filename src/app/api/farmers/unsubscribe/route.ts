import { NextRequest, NextResponse } from "next/server";
import { unsubscribeFarmer } from "@/lib/farmer-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number required to unsubscribe." }, { status: 400 });
    }

    const success = unsubscribeFarmer(phone);

    if (success) {
      return NextResponse.json({ message: "Successfully unsubscribed farmer." }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Farmer with that phone number not found." }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
