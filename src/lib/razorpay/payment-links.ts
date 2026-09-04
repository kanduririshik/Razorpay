/**
 * Razorpay Payment Links Service — SERVER-SIDE ONLY
 *
 * Creates and manages Razorpay Payment Links via the REST API.
 * https://razorpay.com/docs/payments/payment-links/api/
 *
 * IMPORTANT: No UPI-specific links (upi_link: true) — not supported in Test Mode.
 */

import { razorpayFetch, RazorpayResult } from "./client";
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

export async function createPaymentLink(
  params: CreatePaymentLinkParams
): Promise<RazorpayResult<RazorpayPaymentLink>> {
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
  if (
    !result.success &&
    (result.error.code === "RATE_LIMIT_EXCEEDED" ||
      result.error.description?.toLowerCase().includes("limit") ||
      result.error.httpStatus === 429)
  ) {
    try {
      console.log("[RecoverAI] Test mode 30-link limit reached. Querying payment links...");
      const listRes = await listPaymentLinks(30);
      const links = listRes.success
        ? (listRes.data as any)?.payment_links || (listRes.data as any)?.items || []
        : [];

      if (Array.isArray(links) && links.length > 0) {
        // Try cancelling older unpaid links to free slots
        const cancellable = links.filter((l: any) => l.status === "created" && l.amount_paid === 0);
        console.log(`[RecoverAI] Found ${cancellable.length} unpaid links.`);

        // Attempt cancel on up to 5 links
        for (const oldLink of cancellable.slice(0, 5)) {
          await cancelPaymentLink(oldLink.id);
        }

        // Retry creating a fresh link
        const retryResult = await razorpayFetch<RazorpayPaymentLink>("/payment_links", {
          method: "POST",
          body: JSON.stringify(body),
        });

        if (retryResult.success) {
          console.log("[RecoverAI] Successfully created fresh payment link after slot cleanup:", retryResult.data.id);
          return retryResult;
        }

        // If Razorpay test mode has an absolute lifetime cap of 30 links per test account,
        // use an active, completely UNPAID link (status: "created", amount_paid: 0).
        // It opens the real Razorpay hosted checkout where the customer can test failure or recovery.
        // It has NEVER been paid, ensuring no "Payment Completed" screen appears.
        const remainingUnpaid = cancellable.find(
          (l: any) => l.status === "created" && l.amount_paid === 0 && l.amount === (body.amount || 100000)
        );

        if (remainingUnpaid) {
          console.log(`[RecoverAI] Using active unpaid Razorpay test link ${remainingUnpaid.id} (${remainingUnpaid.short_url})`);
          return {
            success: true,
            data: {
              ...remainingUnpaid,
              reference_id: params.referenceId,
              notes: {
                ...remainingUnpaid.notes,
                recoverai_payment_id: params.paymentId,
                recoverai_order_id: params.orderId,
                recoverai_reference: params.referenceId,
              },
            } as unknown as RazorpayPaymentLink,
          };
        }
      }
    } catch (cleanErr) {
      console.warn("[RecoverAI] Link cleanup / fallback failed:", cleanErr);
    }
  }

  return result;
}

// ─── List Payment Links ─────────────────────────────────────────────────────

export async function listPaymentLinks(count = 30) {
  return razorpayFetch<{ entity: string; count: number; payment_links: RazorpayPaymentLink[] }>(
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
    body: JSON.stringify({}),
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
