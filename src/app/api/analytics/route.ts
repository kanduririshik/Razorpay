import { NextRequest, NextResponse } from "next/server";
import { getStoredState, queryAnalyticsData } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get("range") || "30D") as "7D" | "30D" | "90D";

    const state = getStoredState();
    const result = queryAnalyticsData(state, range);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics", message: error.message },
      { status: 500 }
    );
  }
}
