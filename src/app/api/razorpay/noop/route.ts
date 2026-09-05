import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// No-op endpoint — silently absorbs Razorpay telemetry redirected from blocked lumberjack hosts
// Accepts any HTTP method and returns 204 No Content
export async function GET() {
  return new NextResponse(null, { status: 204 });
}
export async function POST() {
  return new NextResponse(null, { status: 204 });
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
