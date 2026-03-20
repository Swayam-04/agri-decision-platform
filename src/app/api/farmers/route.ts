import { NextResponse } from "next/server";
import { getFarmers } from "@/lib/farmer-db";

export async function GET() {
  const farmers = getFarmers();
  return NextResponse.json({ farmers, count: farmers.length }, { status: 200 });
}
