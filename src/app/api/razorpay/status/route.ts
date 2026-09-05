import { NextResponse } from "next/server";
import { getRazorpayConfig } from "@/lib/razorpay/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = getRazorpayConfig();
  const isTestMode = config.keyId.startsWith("rzp_test_");

  if (!config.isConfigured) {
    return NextResponse.json({
      configured: false,
      mode: "unconfigured",
      apiReachable: false,
      error: "Razorpay credentials not configured",
      keyIdMasked: config.keyIdMasked,
      appUrl: config.appUrl,
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  const startTime = Date.now();

  try {
    const authHeader =
      "Basic " +
      Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");

    // Safe, non-mutating, authenticated test against official Razorpay Orders endpoint
    const response = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return NextResponse.json({
        configured: true,
        mode: isTestMode ? "test" : "live",
        apiReachable: true,
        apiStatus: response.status,
        responseTimeMs: latencyMs,
        keyIdMasked: config.keyIdMasked,
        appUrl: config.appUrl,
      });
    } else {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch {
        errorBody = `HTTP ${response.status} ${response.statusText}`;
      }

      return NextResponse.json({
        configured: true,
        mode: isTestMode ? "test" : "live",
        apiReachable: true,
        apiStatus: response.status,
        error: errorBody,
        responseTimeMs: latencyMs,
        keyIdMasked: config.keyIdMasked,
        appUrl: config.appUrl,
      });
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    const isTimeout =
      err.name === "AbortError" ||
      err.message?.includes("aborted") ||
      err.message?.includes("timeout");

    return NextResponse.json({
      configured: true,
      mode: isTestMode ? "test" : "live",
      apiReachable: false,
      error: isTimeout
        ? "Razorpay API connection timeout (10s)"
        : err?.message || "Connection failed",
      responseTimeMs: latencyMs,
      keyIdMasked: config.keyIdMasked,
      appUrl: config.appUrl,
    });
  }
}
