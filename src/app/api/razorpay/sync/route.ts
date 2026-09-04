/**
 * GET /api/razorpay/sync
 *
 * Client polling endpoint to retrieve server-verified payment recovery events.
 *
 * Since webhooks and callback verification happen server-side but the app state
 * lives in browser LocalStorage, the client polls this endpoint to detect
 * when a payment has been server-verified and can safely update local state.
 *
 * Calling this endpoint drains (clears) the sync buffer, so each event
 * is only returned once. Call at 2-3 second intervals.
 *
 * Query params:
 *   ?paymentId=PAY98231   — Optional: check one specific payment
 *
 * Response:
 * {
 *   events: VerifiedRecoveryEvent[];   — Empty array if nothing new
 *   timestamp: string;
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  drainVerifiedRecoveries,
  getVerifiedRecovery,
  drainFailedPayments,
  getFailedPayment,
} from "@/lib/razorpay/sync-buffer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specificPaymentId = searchParams.get("paymentId");

  if (specificPaymentId) {
    // Check a specific payment without draining
    const recoveryEvent = getVerifiedRecovery(specificPaymentId);
    const failedEvent = getFailedPayment(specificPaymentId);
    return NextResponse.json({
      events: recoveryEvent ? [recoveryEvent] : [],
      failedEvents: failedEvent ? [failedEvent] : [],
      timestamp: new Date().toISOString(),
    });
  }

  // Drain all events
  const events = drainVerifiedRecoveries();
  const failedEvents = drainFailedPayments();
  return NextResponse.json({
    events,
    failedEvents,
    timestamp: new Date().toISOString(),
  });
}
