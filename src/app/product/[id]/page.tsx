"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FURNITURE_PRODUCTS,
  FurnitureProduct,
} from "@/lib/data/initialData";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
import {
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  ArrowRight,
  Zap,
  Sparkles,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params.id as string) || "prod_sofa_01";

  const product =
    FURNITURE_PRODUCTS.find((p) => p.id === productId) || FURNITURE_PRODUCTS[0];

  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useDemoData();

  const isFlagship = product.id === "prod_sofa_01";

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleInstantBuy = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-amber-400">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-amber-400">
          Catalog
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-200 truncate">{product.name}</span>
      </div>

      {/* Signature Highlight Notice */}
      {isFlagship && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300">
              <strong className="text-white">Architectural Signature Piece:</strong> Handcrafted from kiln-dried Grade-A teakwood with 10-year structural warranty and complimentary white-glove setup.
            </span>
          </div>
          <button
            onClick={handleInstantBuy}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 transition-all shadow-md shadow-amber-500/20"
          >
            Instant Checkout
          </button>
        </div>
      )}

      {/* Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Image View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl aspect-[4/3]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 font-mono text-xs font-semibold border border-amber-500/30">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Right Details & Buying Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-200">
                {product.rating} / 5.0
              </span>
              <span className="text-xs text-slate-500">
                ({product.reviewsCount} verified reviews)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              {product.name}
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 block uppercase font-mono">Special Price</span>
              <div className="flex items-baseline space-x-3 mt-1">
                <span className="text-3xl font-bold text-amber-400 font-mono">
                  {formatINR(product.price)}
                </span>
                <span className="text-sm line-through text-slate-500 font-mono">
                  {formatINR(product.originalPrice)}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              IN STOCK • READY TO SHIP
            </span>
          </div>

          {/* Specifications Table */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block">Dimensions</span>
              <span className="text-slate-200 font-semibold mt-0.5 block">{product.dimensions}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 block">Material</span>
              <span className="text-slate-200 font-semibold mt-0.5 block">{product.material}</span>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-400 font-mono">Quantity:</span>
              <div className="flex items-center border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold font-mono text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center space-x-2 ${
                  isAdded
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={handleInstantBuy}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <span>Instant Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2 text-slate-300">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Complimentary express delivery to Bengaluru, Mumbai, Delhi &amp; all metros</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>10-year structural warranty on solid hardwood frames</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <RotateCcw className="w-4 h-4 text-blue-400 shrink-0" />
              <span>100-day hassle-free in-home trial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
