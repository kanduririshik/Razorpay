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
}

// ─── Create Payment Link ─────────────────────────────────────────────────────

export interface CreatePaymentLinkParams {
  amount: number;         // Amount in rupees (will be converted to paise)
  currency?: string;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  referenceId: string;    // e.g. "RECOVER-PAY98231-1234567890"
  orderId: string;        // e.g. "RA98231"
  paymentId: string;      // e.g. "PAY98231"
  callbackUrl?: string;
}

export async function createPaymentLink(params: CreatePaymentLinkParams) {
  const config = getRazorpayConfig();

  const callbackUrl =
    params.callbackUrl ??
    `${config.appUrl}/payment-recovery/callback`;

  // Razorpay expects amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(params.amount * 100);

  const body = {
    amount: amountInPaise,
    currency: params.currency ?? "INR",
    accept_partial: false,
    description: params.description,
    customer: {
      name: params.customerName,
      email: params.customerEmail,
      contact: params.customerPhone,
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
    },
    reference_id: params.referenceId,
    callback_url: callbackUrl,
    callback_method: "get",
  };

  return razorpayFetch<RazorpayPaymentLink>("/payment_links", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Fetch Payment Link Status ───────────────────────────────────────────────

export async function fetchPaymentLink(linkId: string) {
  return razorpayFetch<RazorpayPaymentLink>(`/payment_links/${linkId}`);
}

// ─── Cancel Payment Link ─────────────────────────────────────────────────────

export async function cancelPaymentLink(linkId: string) {
  return razorpayFetch<{ success: boolean }>(`/payment_links/${linkId}/cancel`, {
    method: "PATCH",
  });
}

// ─── Verify a Payment by ID ──────────────────────────────────────────────────

export async function verifyPaymentById(razorpayPaymentId: string) {
  return razorpayFetch<RazorpayPayment>(`/payments/${razorpayPaymentId}`);
}

// ─── Generate unique reference ID ───────────────────────────────────────────

export function generateRecoveryReferenceId(paymentId: string): string {
  const suffix = Date.now().toString(36).toUpperCase();
  return `RECOVER-${paymentId}-${suffix}`;
}
