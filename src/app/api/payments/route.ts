import { NextRequest, NextResponse } from "next/server";
import { getStoredState, queryPayments } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "ALL";
    const method = searchParams.get("method")?.trim() || "ALL";
    const failureReason = searchParams.get("failureReason")?.trim() || "ALL";
    const priority = searchParams.get("priority")?.trim() || "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));

    const state = getStoredState();
    const result = queryPayments(state, {
      page,
      limit,
      search,
      status,
      method,
      failureReason,
      priority,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments", message: error.message },
      { status: 500 }
    );
  }
}
