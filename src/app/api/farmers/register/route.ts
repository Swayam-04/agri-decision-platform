import { NextRequest, NextResponse } from "next/server";
import { addFarmer, getFarmers } from "@/lib/farmer-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, region, crop, consent } = body;

    // Strict validation
    if (!name || !phone || !region || !crop) {
      return NextResponse.json(
        { error: "Required fields missing: name, phone, region, crop." },
        { status: 400 }
      );
    }

    if (consent === undefined || consent === null) {
      return NextResponse.json(
        { error: "Consent parameter must be explicitly true or false." },
        { status: 400 }
      );
    }

    const result = addFarmer({ name, phone, region, crop, consent });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.farmer, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const farmers = getFarmers();
  return NextResponse.json({ farmers, count: farmers.length }, { status: 200 });
}
