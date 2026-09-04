/**
 * Razorpay Configuration — SERVER-SIDE ONLY
 *
 * This module reads Razorpay credentials exclusively from server-side
 * environment variables. It must NEVER be imported into client components.
 *
 * SECURITY:
 * - RAZORPAY_KEY_SECRET is never exposed to the browser
 * - RAZORPAY_WEBHOOK_SECRET is never exposed to the browser
 * - Only RAZORPAY_KEY_ID may be used client-side (via NEXT_PUBLIC_ if needed)
 */

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  appUrl: string;
  isConfigured: boolean;
  /** Safe masked version of Key ID for display (e.g. "rzp_test_Ab...Xy") */
  keyIdMasked: string;
}

function maskKeyId(keyId: string): string {
  if (!keyId || keyId.length < 12) return "rzp_test_***";
  return keyId.slice(0, 12) + "..." + keyId.slice(-4);
}

export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const isConfigured = Boolean(keyId && keySecret && keyId.startsWith("rzp_"));

  return {
    keyId,
    keySecret,
    webhookSecret,
    appUrl,
    isConfigured,
    keyIdMasked: maskKeyId(keyId),
  };
}
