import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = getDashboardData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in /api/dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data", message: error.message },
      { status: 500 }
    );
  }
}
