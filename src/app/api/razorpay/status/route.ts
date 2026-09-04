import { NextResponse } from "next/server";
import { getRazorpayConfig } from "@/lib/razorpay/config";

export const runtime = "nodejs";

export async function GET() {
  const config = getRazorpayConfig();
  const isTestMode = config.keyId.startsWith("rzp_test_");

  return NextResponse.json({
    configured: config.isConfigured,
    mode: isTestMode ? "test" : config.isConfigured ? "live" : "unconfigured",
    keyIdMasked: config.keyIdMasked,
    appUrl: config.appUrl,
  });
}
