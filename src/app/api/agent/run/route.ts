import { NextRequest, NextResponse } from "next/server";
import { getStoredState, executeStoreRecovery } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    let paymentId = body.paymentId;

    if (!paymentId) {
      const state = getStoredState();
      const rahul = state.customers.find((c) => c.name.includes("Rahul Sharma"));
      const rahulPayment = rahul
        ? state.payments.find((p) => p.customerId === rahul.id && p.status === "FAILED")
        : null;

      if (rahulPayment) {
        paymentId = rahulPayment.paymentId;
      } else {
        const topFailed = state.payments
          .filter((p) => p.status === "FAILED")
          .sort((a, b) => b.amount - a.amount)[0];

        if (!topFailed) {
          return NextResponse.json(
            { message: "No active failed payments found to recover." },
            { status: 200 }
          );
        }
        paymentId = topFailed.paymentId;
      }
    }

    const result = executeStoreRecovery(paymentId);

    return NextResponse.json({
      success: true,
      simulation: result,
    });
  } catch (error: any) {
    console.error("Error in /api/agent/run:", error);
    return NextResponse.json(
      { error: "Agent run execution failed", message: error.message },
      { status: 500 }
    );
  }
}
