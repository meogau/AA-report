import { NextResponse } from "next/server";
import { getPropertySummary } from "@/lib/property-data";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    summary: getPropertySummary()
  });
}
