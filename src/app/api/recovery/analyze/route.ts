import { NextRequest, NextResponse } from "next/server";
import { getStoredState, queryPaymentById } from "@/lib/data/store";
import { RevenueRecoveryAgent } from "@/services/revenueRecoveryAgent";

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

    const state = getStoredState();
    const result = queryPaymentById(state, paymentId);

    if (!result || !result.payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const customer = result.payment.customer || {
      id: "cust_unknown",
      name: "Customer",
      email: "cust@example.com",
      phone: "+91 99999 00000",
      lifetimeValue: 25000,
      totalPayments: 5,
      successfulPayments: 4,
      failedPayments: 1,
      preferredPaymentMethod: "UPI",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const analysis = RevenueRecoveryAgent.analyze(customer as any, result.payment as any);

    return NextResponse.json({
      paymentId: result.payment.paymentId,
      customerName: customer.name,
      amount: result.payment.amount,
      analysis,
    });
  } catch (error: any) {
    console.error("Error in /api/recovery/analyze:", error);
    return NextResponse.json(
      { error: "Analysis failed", message: error.message },
      { status: 500 }
    );
  }
}
