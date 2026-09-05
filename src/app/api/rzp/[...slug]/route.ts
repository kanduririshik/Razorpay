import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  return handleProxy(request, await params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  return handleProxy(request, await params);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

async function handleProxy(request: NextRequest, { slug }: { slug: string[] }) {
  try {
    const search = request.nextUrl.search;
    const path = (slug || []).join("/");
    const targetUrl = `https://api.razorpay.com/${path}${search}`;

    console.log(`[RZP Proxy] Forwarding to: ${targetUrl}`);

    const reqHeaders = new Headers();
    request.headers.forEach((value, key) => {
      // Avoid forwarding host or compression headers that might conflict
      const lower = key.toLowerCase();
      if (!["host", "connection", "content-length"].includes(lower)) {
        reqHeaders.set(key, value);
      }
    });
    reqHeaders.set("Host", "api.razorpay.com");
    reqHeaders.set("Origin", "https://api.razorpay.com");

    const body =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.arrayBuffer()
        : undefined;

    const upstreamRes = await fetch(targetUrl, {
      method: request.method,
      headers: reqHeaders,
      body,
      redirect: "follow",
    });

    const resHeaders = new Headers();
    upstreamRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        ![
          "content-encoding",
          "content-length",
          "transfer-encoding",
          "connection",
          "x-frame-options",
          "content-security-policy",
        ].includes(lower)
      ) {
        resHeaders.set(key, value);
      }
    });

    // Ensure iframe can load seamlessly
    resHeaders.set("Access-Control-Allow-Origin", "*");
    resHeaders.set("Access-Control-Allow-Credentials", "true");

    const data = await upstreamRes.arrayBuffer();

    return new NextResponse(data, {
      status: upstreamRes.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error("[RZP Proxy] Error:", err);
    return NextResponse.json(
      { error: "Proxy connection failed", details: err?.message },
      { status: 502 }
    );
  }
}
