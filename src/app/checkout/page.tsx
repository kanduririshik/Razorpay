"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { FURNITURE_PRODUCTS } from "@/lib/data/initialData";
import { formatINR } from "@/lib/utils";
import PaymentFailedModal from "@/components/PaymentFailedModal";
import {
  loadRazorpayCheckoutScript,
  RazorpayCheckoutOptions,
  RazorpayFailureResponse,
  RazorpaySuccessResponse,
} from "@/lib/razorpay/checkout-client";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Lock,
  User,
  MapPin,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, checkout } = useDemoData();
  const { customer } = useCustomerAuth();

  const [customerName, setCustomerName] = useState(customer?.name || "Rahul Sharma");
  const [customerEmail, setCustomerEmail] = useState(customer?.email || "rahul.sharma@gmail.com");
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || "+91 98201 45892");
  const [shippingAddress, setShippingAddress] = useState(
    customer?.address || "Flat 402, Lotus Heights, 12th Main, Indiranagar, Bengaluru - 560038"
  );
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pop-up modal state
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  const [modalFailureReason, setModalFailureReason] = useState("Payment was declined by the bank");
  const [modalPaymentId, setModalPaymentId] = useState("PAY98231");
  const [modalOrderId, setModalOrderId] = useState("RA98231");
  const [modalRzpPaymentId, setModalRzpPaymentId] = useState<string | undefined>(undefined);

  // Preload checkout script on page load
  useEffect(() => {
    loadRazorpayCheckoutScript().catch(() => {});
  }, []);

  useEffect(() => {
    if (customer) {
      if (customer.name) setCustomerName(customer.name);
      if (customer.email) setCustomerEmail(customer.email);
      if (customer.phone) setCustomerPhone(customer.phone);
      if (customer.address) setShippingAddress(customer.address);
    }
  }, [customer]);

  // Detect failed=true from redirect or query
  useEffect(() => {
    if (searchParams.get("failed") === "true") {
      setIsFailedModalOpen(true);
      const reason = searchParams.get("reason");
      if (reason) setModalFailureReason(reason);
      const pid = searchParams.get("paymentId");
      if (pid) setModalPaymentId(pid);
      const oid = searchParams.get("orderId");
      if (oid) setModalOrderId(oid);
      const rzpId = searchParams.get("razorpayPaymentId");
      if (rzpId) setModalRzpPaymentId(rzpId);
    }
  }, [searchParams]);

  const flagshipSofa = FURNITURE_PRODUCTS[0];
  const items = cart.length > 0 ? cart : [{ product: flagshipSofa, quantity: 1 }];
  const totalAmount = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const internalPaymentId = "PAY98231";
      const internalOrderId = "RA98231";

      setModalPaymentId(internalPaymentId);
      setModalOrderId(internalOrderId);

      // 1. Establish order and payment records in shared LocalStorage store
      checkout({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        paymentMethod,
        simulateFailure: false, // REAL Razorpay gateway
        productId: items[0]?.product.id,
      });

      // 2. Ensure Razorpay Standard Checkout script is ready
      const scriptReady = await loadRazorpayCheckoutScript();
      if (!scriptReady || !window.Razorpay) {
        throw new Error("Could not initialize Razorpay checkout. Please check internet connection.");
      }

      // 3. Create a real Razorpay Order via server Orders API
      const normalizedPhone = customerPhone.replace(/\D/g, "");
      const cleanContact =
        normalizedPhone.length >= 8 && normalizedPhone.length <= 14 ? normalizedPhone : "9820145892";

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "initial_checkout",
          orderId: internalOrderId,
          paymentId: internalPaymentId,
          originalAmount: totalAmount,
          customer: {
            name: customerName,
            email: customerEmail,
            contact: cleanContact,
          },
        }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to create Razorpay payment order.");
      }

      // 4. Initialize official Razorpay Standard Checkout modal
      const options: RazorpayCheckoutOptions = {
        key: orderData.keyId,
        amount: orderData.amount, // 100000 paise = ₹1,000 test cap
        currency: orderData.currency || "INR",
        order_id: orderData.orderId,
        name: "Slander's Furniture Store",
        description: `Order #${internalOrderId} — Modern 3-Seater Sofa`,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: cleanContact,
        },
        notes: {
          orderId: internalOrderId,
          paymentId: internalPaymentId,
          originalAmount: totalAmount.toString(),
          testAmount: "1000",
        },
        theme: {
          color: "#0f172a",
        },
        modal: {
          ondismiss: () => {
            console.log("[Checkout] Razorpay modal closed by customer");
            setIsProcessing(false);
          },
        },
        handler: async (response: RazorpaySuccessResponse) => {
          setIsProcessing(false);
          // If customer completed payment successfully
          router.push(`/order/${internalOrderId}?payment=success`);
        },
      };

      const rzp = new window.Razorpay(options);

      // 5. Handle official Razorpay payment failure event
      rzp.on("payment.failed", async (response: RazorpayFailureResponse) => {
        setIsProcessing(false);

        const errorDesc =
          response.error?.description ||
          response.error?.reason ||
          "Payment was declined by the bank";
        const rzpPaymentId = response.error?.metadata?.payment_id || "";
        const rzpOrderId = response.error?.metadata?.order_id || orderData.orderId;

        console.log("[Checkout] Gateway payment failed:", {
          errorDesc,
          rzpPaymentId,
          rzpOrderId,
          code: response.error?.code,
        });

        // Immediately send telemetry to server
        try {
          await fetch("/api/razorpay/record-failure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: rzpOrderId,
              razorpayPaymentId: rzpPaymentId,
              errorCode: response.error?.code || "PAYMENT_FAILED",
              errorDescription: errorDesc,
              errorReason: response.error?.reason || "",
              errorStep: response.error?.step || "",
              errorSource: response.error?.source || "",
              internalOrderId,
              internalPaymentId,
              amount: 1000,
            }),
          });
        } catch (telemetryErr) {
          console.warn("[Checkout] Failed to record failure telemetry:", telemetryErr);
        }

        setModalFailureReason(errorDesc);
        setModalRzpPaymentId(rzpPaymentId);
        setIsFailedModalOpen(true);

        // Navigate to payment failed page
        router.push(
          `/payment-failed?orderId=${encodeURIComponent(internalOrderId)}&paymentId=${encodeURIComponent(internalPaymentId)}&reason=${encodeURIComponent(errorDesc)}&razorpayPaymentId=${encodeURIComponent(rzpPaymentId)}`
        );
      });

      // 6. Open the official Razorpay Checkout interface
      rzp.open();
    } catch (err: any) {
      console.error("[Checkout] Error initiating Razorpay Standard Checkout:", err);
      setIsProcessing(false);
      setErrorMessage(err.message || "Payment gateway unavailable. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Payment Failed Modal Pop-up */}
      <PaymentFailedModal
        isOpen={isFailedModalOpen}
        onClose={() => setIsFailedModalOpen(false)}
        orderId={modalOrderId}
        paymentId={modalPaymentId}
        amount={totalAmount}
        testAmount={1000}
        failureReason={modalFailureReason}
        onRetry={() => {
          setIsProcessing(false);
        }}
      />

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
            Slander&apos;s Furniture Store • Razorpay Standard Payment Gateway
          </p>
        </div>

        {/* Order Reference Badge */}
        <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Order Reference: Modern 3-Seater Sofa (₹32,999)</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Customer & Shipping & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Information Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
              <User className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Customer Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 block font-medium">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 block font-medium">Phone (with country code)</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-slate-400 block font-medium">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
              <MapPin className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">White-Glove Delivery Address</h2>
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 block font-medium">Address & Landmark</label>
              <textarea
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
              <CreditCard className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold text-white">Payment Method</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                  paymentMethod === "UPI"
                    ? "bg-amber-500/10 border-amber-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <QrCode className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">UPI / QR (Recommended)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Google Pay, PhonePe, Paytm, or UPI ID
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                  paymentMethod === "CARD"
                    ? "bg-amber-500/10 border-amber-500 text-white"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Credit / Debit Card</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Visa, Mastercard, RuPay, Amex
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Summary: Order Review & Razorpay Trigger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl sticky top-24">
            <h3 className="text-lg font-serif font-bold text-white border-b border-slate-800 pb-3">
              Order Summary
            </h3>

            {/* Item List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{item.product.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Qty: {item.quantity} × {formatINR(item.product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-white font-mono shrink-0">
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
                <span>White-Glove Delivery</span>
                <span className="font-mono text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800/80">
                <span>Total Order Value</span>
                <span className="text-amber-400 font-mono text-xl">
                  {formatINR(totalAmount)}
                </span>
              </div>
            </div>

            {/* TEST PAYMENT INSTRUCTION CARD */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-2.5">
              <div className="flex items-center space-x-2 text-blue-300 font-semibold font-mono text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>RAZORPAY TEST MODE</span>
              </div>
              <div className="text-slate-300 text-[11px] leading-relaxed space-y-1">
                <p className="font-semibold text-white">For the failed-payment test:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pt-0.5">
                  <li>Click Place Order</li>
                  <li>Razorpay Standard Checkout modal opens</li>
                  <li>Select UPI</li>
                  <li>Enter: <code className="text-amber-300 bg-black/60 px-1.5 py-0.5 rounded font-mono font-bold select-all">failure@razorpay</code></li>
                  <li>Complete the test payment attempt</li>
                  <li>Razorpay reports PAYMENT FAILED with actual decline reason</li>
                </ol>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-blue-500/20">
                Razorpay Test Mode — ₹1,000 test transaction. Original order value: ₹32,999.
              </p>
            </div>

            {/* PRIMARY CTA: PLACE ORDER */}
            <div className="space-y-3 pt-1">
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Opening Razorpay Gateway...</span>
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
                  Opens official Razorpay Standard Checkout • 256-Bit SSL
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Official Gateway:</strong> Powered by Razorpay Standard Checkout (`checkout.js`) with Orders API.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
