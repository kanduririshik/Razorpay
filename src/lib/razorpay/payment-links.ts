/**
 * Razorpay Payment Links Service — SERVER-SIDE ONLY
 *
 * Creates and manages Razorpay Payment Links via the REST API.
 * https://razorpay.com/docs/payments/payment-links/api/
 *
 * IMPORTANT: No UPI-specific links (upi_link: true) — not supported in Test Mode.
 */

import { razorpayFetch } from "./client";
import { getRazorpayConfig } from "./config";

// ─── Razorpay API Response Types ────────────────────────────────────────────

export interface RazorpayPaymentLink {
  id: string;
  entity: string;
  accept_partial: boolean;
  amount: number;
  amount_paid: number;
  callback_method: string;
  callback_url: string;
  cancelled_at: number;
  created_at: number;
  currency: string;
  customer: {
    contact: string;
    email: string;
    name: string;
  };
  description: string;
  expire_by: number;
  expired_at: number;
  first_min_partial_amount: number;
  notes: Record<string, string>;
  notify: { email: boolean; sms: boolean };
  payments: unknown[] | null;
  reference_id: string;
  reminder_enable: boolean;
  short_url: string;
  status: "created" | "partially_paid" | "expired" | "cancelled" | "paid";
  updated_at: number;
  upi_link: boolean;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  order_id: string | null;
  invoice_id: string | null;
  payment_link_id: string | null;
  method: string;
  description: string;
  email: string;
  contact: string;
  captured: boolean;
  error_code: string | null;
  error_description: string | null;
  error_reason?: string | null;
}

// ─── Create Payment Link ─────────────────────────────────────────────────────

export interface CreatePaymentLinkParams {
  amount: number;         // Amount in rupees (will be converted to paise)
  originalAmount?: number; // Original business amount (e.g. 32999)
  currency?: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  referenceId: string;    // e.g. "RECOVER-PAY98231-1234567890"
  orderId: string;        // e.g. "RA98231"
  paymentId: string;      // e.g. "PAY98231"
  callbackUrl?: string;
  notes?: Record<string, string>;
}

export async function createPaymentLink(params: CreatePaymentLinkParams) {
  const config = getRazorpayConfig();

  const callbackUrl =
    params.callbackUrl ??
    `${config.appUrl}/payment-recovery/callback`;

  // Razorpay expects amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(params.amount * 100);

  // Normalize phone number strictly for Razorpay (8-14 digits only, no spaces, +, hyphens)
  let normalizedContact = (params.customerPhone || "").replace(/\D/g, "");
  if (normalizedContact.length < 8 || normalizedContact.length > 14) {
    normalizedContact = "9820145892";
  }

  const body = {
    amount: amountInPaise,
    currency: params.currency ?? "INR",
    accept_partial: false,
    description: params.description,
    customer: {
      name: params.customerName,
      email: params.customerEmail,
      contact: normalizedContact,
    },
    notify: {
      sms: false,
      email: false,
    },
    reminder_enable: false,
    notes: {
      recoverai_payment_id: params.paymentId,
      recoverai_order_id: params.orderId,
      recoverai_reference: params.referenceId,
      original_amount: String(params.originalAmount ?? params.amount),
      test_recovery_amount: String(params.amount),
      payment_id: params.paymentId,
      purpose: "RecoverAI recovery test",
      ...(params.notes ?? {}),
    },
    reference_id: params.referenceId,
    callback_url: callbackUrl,
    callback_method: "get",
  };

  let result = await razorpayFetch<RazorpayPaymentLink>("/payment_links", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // If Test Mode limit reached ("test mode limit of 30 reached for payment_link"):
  // Clean up older active/unpaid links to free quota and retry creating a fresh link
  if (
    !result.success &&
    (result.error.code === "RATE_LIMIT_EXCEEDED" ||
      result.error.description?.toLowerCase().includes("limit"))
  ) {
    try {
      console.log("[RecoverAI] Test mode limit reached. Cleaning up older unpaid payment links...");
      const listRes = await listPaymentLinks(25);
      if (listRes.success && Array.isArray(listRes.data?.items)) {
        // Cancel only links that are still in "created" status
        const cancellable = listRes.data.items.filter((l) => l.status === "created");
        console.log(`[RecoverAI] Found ${cancellable.length} unpaid links to cancel.`);
        for (const oldLink of cancellable.slice(0, 8)) {
          await cancelPaymentLink(oldLink.id);
        }
        // Retry creating a fresh payment link
        result = await razorpayFetch<RazorpayPaymentLink>("/payment_links", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
    } catch (cleanErr) {
      console.warn("[RecoverAI] Link cleanup failed:", cleanErr);
    }
  }

  return result;
}

// ─── List Payment Links ─────────────────────────────────────────────────────

export async function listPaymentLinks(count = 30) {
  return razorpayFetch<{ entity: string; count: number; items: RazorpayPaymentLink[] }>(
    `/payment_links?count=${count}`
  );
}

// ─── Fetch Payment Link Status ───────────────────────────────────────────────

export async function fetchPaymentLink(linkId: string) {
  return razorpayFetch<RazorpayPaymentLink>(`/payment_links/${linkId}`);
}

// ─── Cancel Payment Link (POST /payment_links/:id/cancel) ────────────────────

export async function cancelPaymentLink(linkId: string) {
  return razorpayFetch<RazorpayPaymentLink>(`/payment_links/${linkId}/cancel`, {
    method: "POST",
  });
}

// ─── Verify a Payment by ID ──────────────────────────────────────────────────

export async function verifyPaymentById(razorpayPaymentId: string) {
  return razorpayFetch<RazorpayPayment>(`/payments/${razorpayPaymentId}`);
}

// ─── Generate unique reference ID ───────────────────────────────────────────

export function generateRecoveryReferenceId(paymentId: string, type: string = "recovery", orderId: string = "RA98231"): string {
  const suffix = Date.now().toString(36).toUpperCase();
  const prefix = type === "initial_checkout" ? "INITIAL" : "RECOVER";
  return `${prefix}-${orderId}-${suffix}`;
}
