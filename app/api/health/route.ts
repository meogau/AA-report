import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "aa-report-site",
    timestamp: new Date().toISOString()
  });
}
