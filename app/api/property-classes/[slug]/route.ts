import { NextResponse } from "next/server";
import { getPropertyClassBySlug } from "@/lib/property-data";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const item = getPropertyClassBySlug(slug);

  return NextResponse.json({
    ok: Boolean(item),
    item
  });
}
