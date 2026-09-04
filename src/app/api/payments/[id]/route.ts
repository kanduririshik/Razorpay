import { NextRequest, NextResponse } from "next/server";
import { getStoredState, queryPaymentById } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const state = getStoredState();
    const result = queryPaymentById(state, id);

    if (!result) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/payments/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details", message: error.message },
      { status: 500 }
    );
  }
}
