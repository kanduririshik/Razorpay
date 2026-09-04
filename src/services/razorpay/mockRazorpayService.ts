import {
  IRazorpayService,
  RazorpayPaymentLinkRequest,
  RazorpayPaymentLinkResponse,
  RazorpayRetryPaymentRequest,
  RazorpayRetryPaymentResponse,
} from "./types";

/**
 * MockRazorpayService
 * Phase 1 Mock Implementation:
 * - Provides realistic simulated responses matching Razorpay API specs.
 * - Does NOT require API keys, credentials, or network requests.
 * - In Phase 2, this can be swapped with real Razorpay SDK client without modifying the rest of the app.
 */
export class MockRazorpayService implements IRazorpayService {
  isLiveMode(): boolean {
    return false;
  }

  async createPaymentLink(
    request: RazorpayPaymentLinkRequest
  ): Promise<RazorpayPaymentLinkResponse> {
    const randomId = Math.random().toString(36).substring(2, 9);
    const linkId = `plink_sim_${randomId}`;
    const shortUrl = `https://rzp.io/i/sim_${randomId}`;

    // Deterministic simulation output - no real email/SMS sent
    return {
      id: linkId,
      short_url: shortUrl,
      status: "created",
      amount: request.amount,
      currency: request.currency,
      description: request.description,
      customer: request.customer,
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  async retryPayment(
    request: RazorpayRetryPaymentRequest
  ): Promise<RazorpayRetryPaymentResponse> {
    const randomId = Math.random().toString(36).substring(2, 9);
    return {
      success: true,
      retryId: `retry_sim_${randomId}`,
      message: "Payment retry simulated successfully.",
      status: "captured",
    };
  }

  async getPaymentDetails(paymentId: string): Promise<Record<string, unknown>> {
    return {
      id: paymentId,
      entity: "payment",
      amount: 899900,
      currency: "INR",
      status: "failed",
      method: "upi",
      description: "Simulated payment retrieval",
      created_at: Math.floor(Date.now() / 1000),
    };
  }
}

export const razorpayService: IRazorpayService = new MockRazorpayService();
export default razorpayService;
