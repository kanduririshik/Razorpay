import { NextRequest, NextResponse } from "next/server";
import { getStoredState, queryRecoveryData } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));
    const status = searchParams.get("status") || "ALL";
    const strategy = searchParams.get("strategy") || "ALL";

    const state = getStoredState();
    const result = queryRecoveryData(state, {
      page,
      limit,
      strategy,
      status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/recovery:", error);
    return NextResponse.json(
      { error: "Failed to fetch recovery data", message: error.message },
      { status: 500 }
    );
  }
}
