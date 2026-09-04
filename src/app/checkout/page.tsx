"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { FURNITURE_PRODUCTS } from "@/lib/data/initialData";
import { formatINR } from "@/lib/utils";
import {
  CreditCard,
  Building2,
  QrCode,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Lock,
  User,
  MapPin,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, checkout, addToCart } = useDemoData();

  const [customerName, setCustomerName] = useState("Rahul Sharma");
  const [customerEmail, setCustomerEmail] = useState("rahul.sharma@gmail.com");
  const [customerPhone, setCustomerPhone] = useState("+91 98201 45892");
  const [shippingAddress, setShippingAddress] = useState(
    "Flat 402, Lotus Heights, 12th Main, Indiranagar, Bengaluru - 560038"
  );
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSimulationType, setActiveSimulationType] = useState<"FAILURE" | "SUCCESS" | null>(null);

  // Realistic Gateway Simulation States
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [gatewayStep, setGatewayStep] = useState(0);
  const [demoOutcome, setDemoOutcome] = useState<"FAILURE" | "SUCCESS">("FAILURE");
  const [showDemoControls, setShowDemoControls] = useState(false);

  const flagshipSofa = FURNITURE_PRODUCTS[0];

  // If cart is empty, ensure flagship item is present
  const items = cart.length > 0 ? cart : [{ product: flagshipSofa, quantity: 1 }];
  const totalAmount = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handlePlaceOrder = async (overrideOutcome?: "FAILURE" | "SUCCESS") => {
    const outcome = overrideOutcome || demoOutcome;
    const simulateFailure = outcome === "FAILURE";

    setShowGatewayModal(true);
    setGatewayStep(1); // Connecting...
    setIsProcessing(true);
    setActiveSimulationType(outcome);

    // Sequence of simulated gateway verification steps
    await new Promise((res) => setTimeout(res, 600));
    setGatewayStep(2); // Authenticating UPI...

    await new Promise((res) => setTimeout(res, 700));
    setGatewayStep(3); // Processing transaction...

    await new Promise((res) => setTimeout(res, 800));
    setGatewayStep(4); // Gateway outcome received

    // Perform state update in shared Local Storage
    const result = checkout({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentMethod,
      simulateFailure,
      productId: items[0]?.product.id,
    });

    await new Promise((res) => setTimeout(res, 700));
    setIsProcessing(false);
    setShowGatewayModal(false);

    if (simulateFailure) {
      router.push(`/payment-failed?paymentId=${result.payment.paymentId}&orderId=${result.order.orderId}`);
    } else {
      router.push(`/payment-success?paymentId=${result.payment.paymentId}&orderId=${result.order.orderId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-amber-400">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/cart" className="hover:text-amber-400">
          Cart
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-200">Checkout</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            Checkout
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Secure Razorpay Checkout Gateway • 256-Bit SSL Encrypted
          </p>
        </div>

        {/* Order Reference Badge */}
        <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Order Reference: Modern 3-Seater Sofa (₹32,999)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Customer & Shipping & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Information Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <User className="w-4 h-4 text-amber-400" />
              <span>Customer Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-mono">Phone Number</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-slate-400 font-mono">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Delivery Address</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-mono">Address</label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-medium focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Select Payment Method</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                Instant Payment
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                  paymentMethod === "UPI"
                    ? "bg-amber-500/10 border-amber-500/80 text-white shadow-md shadow-amber-500/10"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <QrCode className={`w-5 h-5 ${paymentMethod === "UPI" ? "text-amber-400" : "text-slate-500"}`} />
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    POPULAR
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-200">UPI</p>
                  <p className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</p>
                </div>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod("Card")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                  paymentMethod === "Card"
                    ? "bg-amber-500/10 border-amber-500/80 text-white shadow-md shadow-amber-500/10"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <CreditCard className={`w-5 h-5 ${paymentMethod === "Card" ? "text-amber-400" : "text-slate-500"}`} />
                <div>
                  <p className="font-semibold text-slate-200">Credit / Debit Card</p>
                  <p className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</p>
                </div>
              </button>

              {/* Net Banking */}
              <button
                type="button"
                onClick={() => setPaymentMethod("Netbanking")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all ${
                  paymentMethod === "Netbanking"
                    ? "bg-amber-500/10 border-amber-500/80 text-white shadow-md shadow-amber-500/10"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Building2 className={`w-5 h-5 ${paymentMethod === "Netbanking" ? "text-amber-400" : "text-slate-500"}`} />
                <div>
                  <p className="font-semibold text-slate-200">Net Banking</p>
                  <p className="text-[10px] text-slate-400">HDFC, ICICI, SBI</p>
                </div>
              </button>
            </div>

            {/* UPI Details Preview */}
            {paymentMethod === "UPI" && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between text-slate-300 font-mono">
                <span>VPA: rahul@okhdfcbank</span>
                <span className="text-amber-400 text-[11px]">Verified UPI</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary & Simulation Action Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-semibold text-white">
                Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
              </h2>
              <span className="text-xs font-mono text-amber-400">#RA98231</span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700/60"
                    style={{ width: "64px", height: "64px", maxWidth: "64px", maxHeight: "64px" }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Qty: {item.quantity} × {formatINR(item.product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {formatINR(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs border-t border-slate-800 pt-4">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">{formatINR(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery</span>
                <span className="font-mono text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800/80">
                <span>Total</span>
                <span className="text-amber-400 font-mono text-xl">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>

            {/* PRIMARY CUSTOMER CTA: PLACE ORDER */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handlePlaceOrder()}
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold rounded-2xl text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2.5"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Place Order • {formatINR(totalAmount)}</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[11px] font-mono text-slate-400">
                  256-Bit SSL Encrypted • Razorpay Gateway
                </span>
              </div>

              {/* PAYMENT SIMULATOR CONTROLS */}
              <div className="border-t border-slate-800/80 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDemoControls(!showDemoControls)}
                  className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors font-mono py-1"
                >
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Payment Routing Controls</span>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {showDemoControls ? "▲ Hide" : "▼ Transaction Routing Options"}
                  </span>
                </button>

                {showDemoControls && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-mono text-[11px]">
                        Default Gateway Scenario:
                      </span>
                      <span className="text-amber-400 font-bold font-mono text-[11px]">
                        {demoOutcome === "FAILURE" ? "Insufficient Funds (Decline 051)" : "Payment Approved (Auth 200)"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDemoOutcome("FAILURE")}
                        className={`p-2 rounded-lg border text-center font-mono text-[11px] transition-all ${
                          demoOutcome === "FAILURE"
                            ? "bg-red-500/20 border-red-500 text-red-300 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Route: Insufficient Funds
                      </button>

                      <button
                        type="button"
                        onClick={() => setDemoOutcome("SUCCESS")}
                        className={`p-2 rounded-lg border text-center font-mono text-[11px] transition-all ${
                          demoOutcome === "SUCCESS"
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Route: Direct Approve
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handlePlaceOrder("FAILURE")}
                        className="flex-1 py-1.5 bg-red-600/30 hover:bg-red-600/40 border border-red-500/40 text-red-200 rounded-lg text-[10px] font-mono font-bold"
                      >
                        Trigger Decline PAY98231
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePlaceOrder("SUCCESS")}
                        className="flex-1 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 rounded-lg text-[10px] font-mono font-bold"
                      >
                        Trigger Authorization
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Secure Checkout:</strong> Transactions are securely verified. In sandbox mode, payment outcomes are processed by the RecoverAI Autonomous Agent.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* REALISTIC PAYMENT GATEWAY MODAL */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            {/* Ambient gateway top light */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                  ₹
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Razorpay Payment Gateway
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    RecoverAI • Secure Transaction Gateway
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                {activeSimulationType === "FAILURE" ? "Mode: Insufficient Funds" : "Mode: Standard Authorization"}
              </span>
            </div>

            {/* Amount and Order Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Payable</span>
                <span className="text-xl font-bold text-white font-mono">{formatINR(totalAmount)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Order ID</span>
                <span className="text-xs font-semibold text-amber-400 font-mono">#RA98231</span>
              </div>
            </div>

            {/* Gateway Steps Progress */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-3">
                {gatewayStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                )}
                <span className={gatewayStep >= 1 ? "text-slate-200" : "text-slate-500"}>
                  Connecting to secure payment gateway...
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {gatewayStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : gatewayStep === 2 ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className={gatewayStep >= 2 ? "text-slate-200" : "text-slate-500"}>
                  Authenticating UPI handle (rahul@okhdfcbank)...
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {gatewayStep > 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : gatewayStep === 3 ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span className={gatewayStep >= 3 ? "text-slate-200" : "text-slate-500"}>
                  Processing payment request of {formatINR(totalAmount)}...
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {gatewayStep >= 4 ? (
                  activeSimulationType === "FAILURE" ? (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )
                ) : (
                  <span className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                )}
                <span
                  className={
                    gatewayStep >= 4
                      ? activeSimulationType === "FAILURE"
                        ? "text-red-300 font-bold"
                        : "text-emerald-300 font-bold"
                      : "text-slate-500"
                  }
                >
                  {gatewayStep >= 4
                    ? activeSimulationType === "FAILURE"
                      ? "Bank Response: Insufficient Funds (Decline Code 051)"
                      : "Bank Response: Transaction Approved (Auth Code 200)"
                    : "Awaiting bank gateway authorization..."}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 text-center font-mono">
              Redirecting to transaction outcome receipt...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
