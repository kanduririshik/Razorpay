/**
 * Client-side Razorpay Standard Checkout Loader & Gateway Bridge
 *
 * Official Checkout: https://checkout.razorpay.com/v1/checkout.js
 * Never accesses RAZORPAY_KEY_SECRET (only public keyId).
 *
 * Bridges Razorpay API calls through Vercel edge rewrite (/v1/...) to prevent
 * client-side ERR_CONNECTION_TIMED_OUT on networks that block direct TCP access to api.razorpay.com.
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
    /** UPI VPA — e.g. "success@razorpay" for test success, "failure@razorpay" for test failure */
    vpa?: string;
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
    __rzp_bridge_installed?: boolean;
  }
}

/**
 * Installs transparent client-side bridge so Razorpay checkout iframe
 * routes through Vercel server proxy instead of timing out against api.razorpay.com.
 */
function installRazorpayNetworkBridge() {
  if (typeof window === "undefined" || window.__rzp_bridge_installed) {
    return;
  }
  window.__rzp_bridge_installed = true;

  const origin = window.location.origin;

  // 1. Pre-configure Razorpay global config before checkout.js initializes
  if (!window.Razorpay) {
    (window as any).Razorpay = {
      config: {
        api: `${origin}/`,
      },
    };
  }

  // 2. Intercept HTMLIFrameElement.src to route api.razorpay.com through Vercel rewrite
  try {
    const iframeProto = HTMLIFrameElement.prototype;
    const originalSrcDesc = Object.getOwnPropertyDescriptor(iframeProto, "src");
    if (originalSrcDesc && originalSrcDesc.set) {
      Object.defineProperty(iframeProto, "src", {
        set(val: string) {
          if (typeof val === "string" && val.startsWith("https://api.razorpay.com/")) {
            val = val.replace("https://api.razorpay.com/", `${origin}/`);
            console.log("[RecoverAI Bridge] Redirected Razorpay iframe src to Vercel proxy:", val);
          }
          return originalSrcDesc.set!.call(this, val);
        },
        get() {
          return originalSrcDesc.get!.call(this);
        },
        configurable: true,
      });
    }

    const originalSetAttribute = iframeProto.setAttribute;
    iframeProto.setAttribute = function (name: string, value: string) {
      if (
        name.toLowerCase() === "src" &&
        typeof value === "string" &&
        value.startsWith("https://api.razorpay.com/")
      ) {
        value = value.replace("https://api.razorpay.com/", `${origin}/`);
        console.log("[RecoverAI Bridge] Redirected setAttribute src to Vercel proxy:", value);
      }
      return originalSetAttribute.call(this, name, value);
    };
  } catch (err) {
    console.warn("[RecoverAI Bridge] Iframe prototype hook notice:", err);
  }

  // 3. Intercept fetch & XHR for api.razorpay.com & silence lumberjack timeouts
  try {
    const originalFetch = window.fetch;
    window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
      if (typeof input === "string") {
        if (input.includes("lumberjack.razorpay.com")) {
          return Promise.resolve(new Response("{}", { status: 200 }));
        }
        if (input.startsWith("https://api.razorpay.com/")) {
          input = input.replace("https://api.razorpay.com/", `${origin}/`);
        }
      }
      return originalFetch.call(this, input, init);
    };

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      ...rest: any[]
    ) {
      let strUrl = typeof url === "string" ? url : url.toString();
      if (strUrl.includes("lumberjack.razorpay.com")) {
        // Redirect telemetry to safe local 204
        strUrl = `${origin}/api/razorpay/status`;
      } else if (strUrl.startsWith("https://api.razorpay.com/")) {
        strUrl = strUrl.replace("https://api.razorpay.com/", `${origin}/`);
      }
      return (originalXhrOpen as any).apply(this, [method, strUrl, ...rest]);
    };
  } catch (err) {
    console.warn("[RecoverAI Bridge] Network hook notice:", err);
  }

  // 4. MutationObserver backup to catch any dynamically inserted iframe
  try {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (let i = 0; i < m.addedNodes.length; i++) {
          const node = m.addedNodes[i];
          if (node instanceof HTMLIFrameElement) {
            if (node.src && node.src.startsWith("https://api.razorpay.com/")) {
              node.src = node.src.replace("https://api.razorpay.com/", `${origin}/`);
            }
          }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch (err) {
    console.warn("[RecoverAI Bridge] MutationObserver notice:", err);
  }
}

/**
 * Dynamically loads the official Razorpay checkout script with network resilience bridge
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    // Install bridge before script runs
    installRazorpayNetworkBridge();

    if (window.Razorpay && typeof window.Razorpay === "function") {
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
      console.error("[RecoverAI] Failed to load Razorpay checkout script from checkout.razorpay.com");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}
