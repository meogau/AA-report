import { NextRequest, NextResponse } from "next/server";
import { getPropertyClasses, searchPropertyClasses } from "@/lib/property-data";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = searchPropertyClasses(query).map((item) => ({
    name: item.name,
    slug: item.slug,
    fieldCount: item.fields.length,
    actionCount: item.actions.length
  }));

  return NextResponse.json({
    ok: true,
    query,
    total: results.length,
    items: query ? results : results.slice(0, getPropertyClasses().length)
  });
}
