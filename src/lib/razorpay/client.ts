/**
 * Razorpay REST API Client — SERVER-SIDE ONLY
 *
 * Uses HTTP Basic Authentication against https://api.razorpay.com/v1
 * Username = RAZORPAY_KEY_ID, Password = RAZORPAY_KEY_SECRET
 *
 * SECURITY: The secret key only ever lives in this server-side module.
 */

import { getRazorpayConfig } from "./config";

const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

export interface RazorpayClientError {
  error: true;
  code: string;
  description: string;
  httpStatus: number;
}

export type RazorpayResult<T> =
  | { success: true; data: T }
  | { success: false; error: RazorpayClientError };

function makeAuthHeader(keyId: string, keySecret: string): string {
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${credentials}`;
}

export async function razorpayFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<RazorpayResult<T>> {
  const config = getRazorpayConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      error: {
        error: true,
        code: "RAZORPAY_NOT_CONFIGURED",
        description: "Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        httpStatus: 503,
      },
    };
  }

  const url = `${RAZORPAY_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": makeAuthHeader(config.keyId, config.keySecret),
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });

    const body = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          error: true,
          code: body?.error?.code ?? "RAZORPAY_API_ERROR",
          description: body?.error?.description ?? `HTTP ${response.status}`,
          httpStatus: response.status,
        },
      };
    }

    return { success: true, data: body as T };
  } catch (err: any) {
    return {
      success: false,
      error: {
        error: true,
        code: "RAZORPAY_NETWORK_ERROR",
        description: err?.message ?? "Network error contacting Razorpay API",
        httpStatus: 503,
      },
    };
  }
}
