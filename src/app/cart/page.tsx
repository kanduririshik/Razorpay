"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemoData } from "@/context/DemoDataContext";
import { FURNITURE_PRODUCTS } from "@/lib/data/initialData";
import { formatINR } from "@/lib/utils";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Armchair,
  Sparkles,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateCartQuantity, removeFromCart, addToCart, clearCart } = useDemoData();

  const flagshipSofa = FURNITURE_PRODUCTS[0];

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const total = subtotal;

  const handleAddFlagship = () => {
    addToCart(flagshipSofa, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your furniture items and proceed to checkout.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-white">Your cart is empty</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explore our curated handcrafted furniture collection.
          </p>
          <button
            onClick={handleAddFlagship}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Modern 3-Seater Sofa (₹32,999)</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                      {item.product.category}
                    </span>
                    <h3 className="text-base font-semibold text-white">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {formatINR(item.product.price)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, item.quantity - 1)
                      }
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, item.quantity + 1)
                      }
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-base font-bold text-amber-400 font-mono">
                    {formatINR(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={clearCart}
                className="text-xs text-slate-500 hover:text-slate-400 font-mono"
              >
                Clear Cart
              </button>
              <Link
                href="/shop"
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                + Add more pieces from catalog
              </Link>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <h2 className="text-base font-semibold text-white">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>White-Glove Shipping</span>
                <span className="font-mono text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Assembly &amp; Room Setup</span>
                <span className="font-mono text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm">
                <span className="font-semibold text-white">Total Amount</span>
                <span className="font-bold text-amber-400 font-mono text-lg">
                  {formatINR(total)}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <div className="flex items-center space-x-1 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Purchase Protection</span>
              </div>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                Every order includes a 10-year structural warranty, transit insurance, and complimentary white-glove setup.
              </p>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulated Razorpay Payment Gateway</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
