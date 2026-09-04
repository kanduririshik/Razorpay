import { NextRequest, NextResponse } from "next/server";
import { executeStoreRecovery } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 }
      );
    }

    const simulationResult = executeStoreRecovery(paymentId);

    return NextResponse.json({
      success: true,
      simulation: simulationResult,
      updatedMetrics: simulationResult.updatedMetrics,
    });
  } catch (error: any) {
    console.error("Error in /api/recovery/simulate:", error);
    return NextResponse.json(
      { error: "Recovery simulation failed", message: error.message },
      { status: 500 }
    );
  }
}
