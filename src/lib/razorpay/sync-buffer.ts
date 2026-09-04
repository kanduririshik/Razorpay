/**
 * Razorpay Sync Buffer — SERVER-SIDE IN-MEMORY STORE
 *
 * Since webhooks/server-side verification cannot directly write browser
 * LocalStorage, this module holds a temporary buffer of verified payment
 * recovery events. The client polls /api/razorpay/sync to retrieve and
 * apply these to its LocalStorage state.
 *
 * This is an in-memory store — it resets on server restart. For production,
 * a persistent store (Redis, Upstash, etc.) could replace this. For the
 * RecoverAI prototype, this is sufficient because callback verification
 * is the primary synchronization path.
 */

export interface VerifiedRecoveryEvent {
  paymentId: string;              // RecoverAI payment ID (e.g. "PAY98231")
  razorpayPaymentId: string;      // Razorpay payment ID (e.g. "pay_xxx")
  razorpayPaymentLinkId: string;  // Razorpay link ID (e.g. "plink_xxx")
  amount: number;                 // Amount in rupees
  status: "RECOVERED";
  verifiedAt: string;             // ISO timestamp
  source: "webhook" | "callback";
}

export interface FailedPaymentEvent {
  paymentId: string;              // RecoverAI payment ID (e.g. "PAY98231")
  orderId: string;                // e.g. "RA98231"
  razorpayPaymentId?: string;
  razorpayPaymentLinkId?: string;
  amount: number;
  failureReason: string;          // Real Razorpay error description
  errorCode?: string;             // Real Razorpay error code
  status: "FAILED";
  timestamp: string;
  source: "webhook" | "status_check" | "callback";
}

// In-memory event buffers (per-server-instance)
const eventBuffer: Map<string, VerifiedRecoveryEvent> = new Map();
const failedBuffer: Map<string, FailedPaymentEvent> = new Map();

/** Store a verified recovery event (called from webhook or callback handler) */
export function storeVerifiedRecovery(event: VerifiedRecoveryEvent): void {
  eventBuffer.set(event.paymentId, event);
}

/** Retrieve a verified recovery event by RecoverAI payment ID */
export function getVerifiedRecovery(paymentId: string): VerifiedRecoveryEvent | undefined {
  return eventBuffer.get(paymentId);
}

/** Retrieve and clear all pending recovery events (used by /api/razorpay/sync polling) */
export function drainVerifiedRecoveries(): VerifiedRecoveryEvent[] {
  const events = Array.from(eventBuffer.values());
  eventBuffer.clear();
  return events;
}

/** Check if a payment has been server-verified */
export function isPaymentServerVerified(paymentId: string): boolean {
  return eventBuffer.has(paymentId);
}

/** Store a failed payment event */
export function storeFailedPayment(event: FailedPaymentEvent): void {
  failedBuffer.set(event.paymentId, event);
}

/** Retrieve a failed payment event by RecoverAI payment ID */
export function getFailedPayment(paymentId: string): FailedPaymentEvent | undefined {
  return failedBuffer.get(paymentId);
}

/** Retrieve and clear all pending failed payment events */
export function drainFailedPayments(): FailedPaymentEvent[] {
  const events = Array.from(failedBuffer.values());
  failedBuffer.clear();
  return events;
}

