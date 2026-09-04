import { NextRequest, NextResponse } from "next/server";
import { getStoredState, queryAgentEvents } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30")));

    const state = getStoredState();
    const events = queryAgentEvents(state, limit);

    return NextResponse.json({
      events: events.map((e) => {
        const payment = state.payments.find((p) => p.id === e.paymentId);
        const customer = payment ? state.customers.find((c) => c.id === payment.customerId) : null;
        let metadata = null;
        try {
          if (e.metadata) metadata = JSON.parse(e.metadata);
        } catch {}

        return {
          id: e.id,
          paymentId: payment?.paymentId || "PAY98231",
          customerName: customer?.name || "Customer",
          amount: payment?.amount || 8999,
          eventType: e.eventType,
          description: e.description,
          metadata,
          createdAt: e.createdAt,
        };
      }),
    });
  } catch (error: any) {
    console.error("Error in /api/agent/events:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent events", message: error.message },
      { status: 500 }
    );
  }
}
