/**
 * Razorpay Orders API Service — SERVER-SIDE ONLY
 *
 * Uses official Razorpay Orders API (POST /v1/orders, GET /v1/orders/:id)
 * https://razorpay.com/docs/api/orders/
 *
 * SECURITY: RAZORPAY_KEY_SECRET never leaves the server.
 */

import { razorpayFetch, RazorpayResult } from "./client";
import { getRazorpayConfig } from "./config";

export interface CreateOrderParams {
  orderId: string;           // Internal order ID (e.g. "RA98231")
  paymentId: string;         // Internal payment ID (e.g. "PAY98231")
  type: "initial_checkout" | "recovery";
  originalAmount?: number;   // Original business order amount (default 32999)
  notes?: Record<string, string>;
}

export interface RazorpayOrderEntity {
  id: string;                // e.g. "order_EKwxwAgItmmXdp"
  entity: "order";
  amount: number;            // Amount in paise (e.g. 100000 for ₹1,000)
  amount_paid: number;
  amount_due: number;
  currency: string;          // "INR"
  receipt: string;           // Unique receipt string
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface CreateOrderResult {
  id: string;                // Razorpay Order ID
  amount: number;            // 100000 (paise)
  currency: string;          // "INR"
  receipt: string;
  keyId: string;             // Public Key ID
  mode: "test" | "live";
  originalAmount: number;    // 32999
  testPaymentAmount: number; // 1000
}

/** Fixed test transaction amount in paise (₹1,000 = 100000 paise) */
export const TEST_TRANSACTION_PAISE = 100000;
export const TEST_TRANSACTION_RUPEES = 1000;
export const DEFAULT_ORDER_AMOUNT_RUPEES = 32999;

/**
 * Creates a new Razorpay Order via POST /v1/orders
 * Always enforces ₹1,000 test amount for test mode safely.
 */
export async function createRazorpayOrder(
  params: CreateOrderParams
): Promise<RazorpayResult<CreateOrderResult>> {
  const config = getRazorpayConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      error: {
        error: true,
        code: "RAZORPAY_NOT_CONFIGURED",
        description: "Razorpay credentials are not configured in environment variables.",
        httpStatus: 503,
      },
    };
  }

  // Unique receipt: rcpt_<orderId>_<timestamp>
  const uniqueReceipt = `rcpt_${params.orderId}_${Date.now().toString(36)}`.slice(0, 40);
  const originalAmount = params.originalAmount || DEFAULT_ORDER_AMOUNT_RUPEES;

  const payload = {
    amount: TEST_TRANSACTION_PAISE,
    currency: "INR",
    receipt: uniqueReceipt,
    notes: {
      orderId: params.orderId,
      paymentId: params.paymentId,
      type: params.type,
      originalAmount: originalAmount.toString(),
      testAmount: TEST_TRANSACTION_RUPEES.toString(),
      ...(params.notes || {}),
    },
  };

  const response = await razorpayFetch<RazorpayOrderEntity>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.success) {
    return response;
  }

  const isTestMode = config.keyId.startsWith("rzp_test_");

  return {
    success: true,
    data: {
      id: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      receipt: response.data.receipt,
      keyId: config.keyId,
      mode: isTestMode ? "test" : "live",
      originalAmount,
      testPaymentAmount: TEST_TRANSACTION_RUPEES,
    },
  };
}

export interface RazorpayPaymentEntity {
  id: string;                // e.g. "pay_xxx"
  entity: "payment";
  amount: number;            // in paise
  currency: string;          // "INR"
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  order_id: string;          // e.g. "order_xxx"
  method: string;            // "upi", "card", etc.
  description?: string;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Fetches an existing Razorpay payment by ID via GET /v1/payments/:id
 */
export async function fetchRazorpayPayment(
  paymentId: string
): Promise<RazorpayResult<RazorpayPaymentEntity>> {
  return razorpayFetch<RazorpayPaymentEntity>(`/payments/${paymentId}`);
}

/**
 * Fetches an existing Razorpay order by ID
 */
export async function fetchRazorpayOrder(
  orderId: string
): Promise<RazorpayResult<RazorpayOrderEntity>> {
  return razorpayFetch<RazorpayOrderEntity>(`/orders/${orderId}`);
}

