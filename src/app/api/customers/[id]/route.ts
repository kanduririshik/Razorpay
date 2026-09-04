import { NextRequest, NextResponse } from "next/server";
import { getStoredState, queryCustomerById } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const state = getStoredState();
    const result = queryCustomerById(state, id);

    if (!result) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in /api/customers/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer profile", message: error.message },
      { status: 500 }
    );
  }
}
