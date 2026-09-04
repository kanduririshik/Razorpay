"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Circle,
  Truck,
  Package,
  MapPin,
  ShieldCheck,
  LayoutDashboard,
  Armchair,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function OrderTrackingPage() {
  const params = useParams();
  const rawId = (params.id as string) || "RA98231";
  const orderId = rawId.toUpperCase().replace(/^#/, "");

  const { getOrder } = useDemoData();
  const order = getOrder(orderId);

  const productName = order?.items[0]?.productName || "Modern 3-Seater Sofa";
  const amount = order?.totalAmount || 32999;
  const customerName = order?.customerName || "Rahul Sharma";
  const address =
    order?.shippingAddress ||
    "Flat 402, Lotus Heights, 12th Main, Indiranagar, Bengaluru - 560038";

  const timelineSteps = [
    {
      id: "pay",
      title: "Payment Confirmed",
      description: "Verified and processed via Razorpay secure recovery.",
      status: "completed",
      time: "Just now",
    },
    {
      id: "ord",
      title: "Order Confirmed",
      description: "Inventory allocated & order confirmed in Indiranagar hub.",
      status: "completed",
      time: "Just now",
    },
    {
      id: "prep",
      title: "Preparing for Shipment",
      description: "White-glove quality inspection & protective linen wrapping in progress.",
      status: "current",
      time: "In Progress",
    },
    {
      id: "ship",
      title: "Shipped",
      description: "Dispatched with Slander's Express dedicated furniture transport.",
      status: "upcoming",
      time: "Expected Tomorrow",
    },
    {
      id: "out",
      title: "Out for Delivery",
      description: "Local logistics team en route with two-person assembly crew.",
      status: "upcoming",
      time: "Pending dispatch",
    },
    {
      id: "del",
      title: "Delivered",
      description: "White-glove placement in your living room and packaging haul-away.",
      status: "upcoming",
      time: "Pending delivery",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-amber-400">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-200">Order #{orderId}</span>
      </div>

      {/* Main Order Confirmation Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold uppercase">
                Order Confirmed
              </span>
              <span className="text-xs text-slate-400 font-mono">#{orderId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              {productName}
            </h1>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-mono">Total Paid</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">
              {formatINR(amount)}
            </span>
          </div>
        </div>

        {/* Shipping Timeline */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
              Shipping Timeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated status telemetry updated from merchant fulfillment center.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {timelineSteps.map((step, idx) => {
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";

              return (
                <div key={step.id} className="flex items-start space-x-4 group">
                  {/* Indicator column with line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : isCurrent
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500 shadow-md shadow-amber-500/20"
                          : "bg-slate-950 text-slate-600 border border-slate-800"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping-slow" />
                      ) : (
                        <Circle className="w-3 h-3 text-slate-700" />
                      )}
                    </div>
                    {idx < timelineSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-10 transition-colors ${
                          isCompleted ? "bg-emerald-500/30" : "bg-slate-800"
                        }`}
                      />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-medium ${
                          isCompleted
                            ? "text-slate-200"
                            : isCurrent
                            ? "text-amber-300 font-semibold"
                            : "text-slate-500"
                        }`}
                      >
                        {isCompleted && "✓ "}
                        {isCurrent && "● "}
                        {!isCompleted && !isCurrent && "○ "}
                        {step.title}
                      </h4>
                      <span
                        className={`text-[11px] font-mono ${
                          isCurrent
                            ? "text-amber-400 font-semibold"
                            : isCompleted
                            ? "text-emerald-400/80"
                            : "text-slate-600"
                        }`}
                      >
                        {step.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destination & Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Delivery Address</span>
            </div>
            <p className="text-slate-200 font-medium">{customerName}</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">{address}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Carrier Service</span>
            </div>
            <p className="text-slate-200 font-medium">Slander&apos;s White-Glove Logistics</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Two-person room-of-choice placement and packaging haul-away included.
            </p>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Furniture Store</span>
          </Link>

          <Link
            href="/admin"
            className="px-5 py-2.5 bg-gradient-to-r from-brand-accent to-ai-600 hover:from-brand-accent/90 hover:to-ai-600/90 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-accent/20 transition-all flex items-center space-x-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>View Merchant Admin Dashboard →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
