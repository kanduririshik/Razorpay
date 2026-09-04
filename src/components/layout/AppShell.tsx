"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SimulationModal from "@/components/agent/SimulationModal";
import ToastNotification from "@/components/ui/ToastNotification";
import { useDemoData } from "@/context/DemoDataContext";
import {
  ShoppingBag,
  Armchair,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Search,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cart } = useDemoData();

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartValue = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Check if current page is Admin portal or Customer portal
  const isAdmin =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/payments") &&
      !pathname.startsWith("/payment-failed") &&
      !pathname.startsWith("/payment-success")) ||
    pathname === "/recovery" ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/analytics");

  if (isAdmin) {
    return (
      <div className="flex bg-[#090d16] text-slate-100 min-h-screen">
        {/* Fixed Admin Sidebar */}
        <Sidebar />

        {/* Main Admin Content Area */}
        <div className="flex-1 ml-64 min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* 6-Stage Autonomous Simulation Modal */}
        <SimulationModal />

        {/* Toast Notifications */}
        <ToastNotification />
      </div>
    );
  }

  // Customer Furniture Store Layout
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Store Announcement Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono text-[10px] font-semibold uppercase tracking-wider border border-amber-500/20">
              Complimentary Shipping
            </span>
            <span className="text-slate-300 text-[11px]">
              Pan-India White-Glove Delivery &amp; Assembly on Orders Above ₹10,000
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
              Demo Admin: admin@recoverai.demo
            </span>
            <Link
              href="/admin"
              className="inline-flex flex-col items-end text-right text-slate-400 hover:text-amber-400 transition-colors group"
            >
              <span className="text-[11px] font-medium flex items-center space-x-1">
                <span>Merchant Admin</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
              </span>
              <span className="text-[9px] font-mono text-slate-400">Demo Access</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Store Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Armchair className="w-5 h-5 text-amber-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold text-white tracking-wider font-serif uppercase">
                  Slander&apos;s
                </span>
                <span className="text-xs uppercase tracking-widest text-amber-300/90 font-light">
                  Furniture
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide uppercase">
                Artisanal Living • Indiranagar
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-300">
            <Link
              href="/"
              className={`hover:text-amber-400 transition-colors ${
                pathname === "/" ? "text-amber-400 font-semibold" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`hover:text-amber-400 transition-colors ${
                pathname === "/shop" ? "text-amber-400 font-semibold" : ""
              }`}
            >
              Shop
            </Link>
            <Link
              href="/shop?cat=living"
              className="hover:text-amber-400 transition-colors"
            >
              Living Room
            </Link>
            <Link
              href="/shop?cat=bedroom"
              className="hover:text-amber-400 transition-colors"
            >
              Bedroom
            </Link>
            <Link
              href="/shop?cat=dining"
              className="hover:text-amber-400 transition-colors"
            >
              Dining
            </Link>
            <Link
              href="/shop"
              className="hover:text-amber-400 transition-colors"
            >
              Collections
            </Link>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/shop"
              aria-label="Search"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-slate-200 transition-all group"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold hidden sm:inline">Cart</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full font-mono">
                  {totalCartCount}
                </span>
              )}
            </Link>

            <Link
              href="/login"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium rounded-xl text-xs transition-colors"
            >
              Account
            </Link>

            <Link
              href="/checkout"
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Instant Checkout</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Customer Page Content */}
      <main className="flex-1">{children}</main>

      {/* Customer Store Footer */}
      <footer className="bg-[#080b11] border-t border-slate-800/80 text-slate-400 text-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Trust Value Propositions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800/60 text-xs">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <Truck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200">White Glove Delivery</p>
                <p className="text-slate-400 text-[11px]">Free delivery &amp; assembly across India</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200">10-Year Warranty</p>
                <p className="text-slate-400 text-[11px]">Handcrafted solid teak &amp; white oak</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <RotateCcw className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200">100-Day In-Home Trial</p>
                <p className="text-slate-400 text-[11px]">Easy returns &amp; seamless exchanges</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-200">Artisanal Craftsmanship</p>
                <p className="text-slate-400 text-[11px]">Kiln-dried timbers &amp; mortise joinery</p>
              </div>
            </div>
          </div>

          {/* Footer Bottom info */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <Armchair className="w-4 h-4 text-amber-400" />
              <span className="font-medium text-slate-300">
                Slander&apos;s Furniture Store
              </span>
              <span>© 2026 Slander&apos;s Living India Pvt. Ltd. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-6 text-slate-400">
              <Link href="/" className="hover:text-slate-200">
                Home
              </Link>
              <Link href="/shop" className="hover:text-slate-200">
                Collections
              </Link>
              <Link href="/cart" className="hover:text-slate-200">
                Cart
              </Link>
              <Link href="/checkout" className="hover:text-slate-200">
                Checkout
              </Link>
              <Link
                href="/admin"
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
              >
                <span>Merchant Admin</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
