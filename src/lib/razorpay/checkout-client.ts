/**
 * Client-side Razorpay Standard Checkout Loader & Types
 *
 * Official Checkout: https://checkout.razorpay.com/v1/checkout.js
 * Never accesses RAZORPAY_KEY_SECRET (only public keyId).
 */

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;            // in paise (e.g. 100000 for ₹1,000)
  currency: string;          // "INR"
  name: string;              // "Slander's Furniture Store"
  description?: string;
  order_id: string;          // Razorpay Order ID from /api/razorpay/create-order
  handler?: (response: RazorpaySuccessResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
    backdrop_color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    backdropclose?: boolean;
    escape?: boolean;
    handleback?: boolean;
    confirm_close?: boolean;
    animation?: boolean;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
      close: () => void;
      on: (
        event: "payment.failed" | string,
        callback: (response: RazorpayFailureResponse) => void
      ) => void;
    };
  }
}

/**
 * Dynamically loads the official Razorpay checkout script if not already present
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("[RecoverAI] Failed to load Razorpay checkout script");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}
