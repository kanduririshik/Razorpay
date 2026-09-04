import { NextRequest, NextResponse } from "next/server";
import { getStoredState, queryCustomers } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const risk = searchParams.get("risk")?.trim() || "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));

    const state = getStoredState();
    const result = queryCustomers(state, {
      page,
      limit,
      search,
      risk,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers", message: error.message },
      { status: 500 }
    );
  }
}
