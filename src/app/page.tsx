"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FURNITURE_PRODUCTS,
  FurnitureProduct,
} from "@/lib/data/initialData";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
import {
  Armchair,
  ShoppingBag,
  Sparkles,
  Star,
  ShieldCheck,
  Truck,
  ArrowRight,
  Check,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function FurnitureHomePage() {
  const router = useRouter();
  const { addToCart } = useDemoData();
  const [addedId, setAddedId] = useState<string | null>(null);

  const flagshipSofa = FURNITURE_PRODUCTS[0];

  const handleAddToCart = (product: FurnitureProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const handleInstantBuy = (product: FurnitureProduct) => {
    addToCart(product, 1);
    router.push("/checkout");
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[520px]">
            {/* Left Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6 z-10">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AUTUMN 2026 ARCHITECTURAL COLLECTION</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
                Timeless Comfort, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
                  Handcrafted For Life.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed font-light">
                Elevate your living space with kiln-dried solid teakwood, acoustic Belgian linen, and high-density pocket spring cushioning. Built to endure generations.
              </p>

              {/* Price Callout */}
              <div className="flex items-baseline space-x-3 pt-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Featured Flagship:</span>
                <span className="text-2xl font-bold text-amber-400 font-mono">₹32,999</span>
                <span className="text-sm line-through text-slate-500 font-mono">₹39,999</span>
                <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-medium">
                  SAVE ₹7,000
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => handleInstantBuy(flagshipSofa)}
                  className="px-7 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] flex items-center space-x-2.5"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-950" />
                  <span>Buy Modern 3-Seater Sofa</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <Link
                  href="/shop"
                  className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors"
                >
                  Explore Catalog
                </Link>
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-6 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Free White-Glove Setup</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>10-Year Teak Warranty</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 relative h-72 lg:h-full min-h-[460px] p-6 lg:p-8 flex items-center justify-center">
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl group">
                <img
                  src={flagshipSofa.image}
                  alt={flagshipSofa.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Modern 3-Seater Sofa</h3>
                    <p className="text-xs text-slate-400">Belgian Linen • Slate Grey</p>
                  </div>
                  <span className="text-base font-bold text-amber-400 font-mono">₹32,999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-semibold">
              Curated Masterpieces
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Featured Furniture Catalog
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
          >
            <span>View all 6 pieces</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FURNITURE_PRODUCTS.map((prod) => {
            const isAdded = addedId === prod.id;
            const isFlagship = prod.id === "prod_sofa_01";

            return (
              <div
                key={prod.id}
                onClick={() => router.push(`/product/${prod.id}`)}
                className={`group bg-slate-900/70 hover:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                  isFlagship
                    ? "border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {isFlagship && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
                          Best Seller
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] font-mono border border-slate-700">
                        {prod.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-semibold flex items-center space-x-1 border border-slate-800">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{prod.rating}</span>
                      <span className="text-[10px] text-slate-400">({prod.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {prod.name}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center space-x-3 pt-1 font-mono">
                      <span>{prod.dimensions}</span>
                      <span>•</span>
                      <span className="truncate">{prod.material}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 pt-0 border-t border-slate-800/60 mt-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {formatINR(prod.price)}
                    </span>
                    <span className="text-xs line-through text-slate-500 font-mono ml-2">
                      {formatINR(prod.originalPrice)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleAddToCart(prod, e)}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isAdded
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white"
                      }`}
                      title="Add to Cart"
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstantBuy(prod);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/10 transition-all"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flagship Product Deep Dive Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-[#0e1422] to-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-semibold">
                Signature Architectural Collection
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Modern 3-Seater Sofa
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                The centerpiece of our living room collection. Tailored in resilient Belgian woven fabric with high-resilience memory foam and individual pocket springs.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block font-mono">Dimensions</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">84&quot; W x 36&quot; D x 34&quot; H</span>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block font-mono">Frame Material</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">Kiln-dried Teakwood</span>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block font-mono">Upholstery</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">Belgian Linen (Stain-Shield)</span>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block font-mono">Fixed Retail Price</span>
                  <span className="font-bold text-amber-400 font-mono mt-0.5 block text-sm">₹32,999</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleInstantBuy(flagshipSofa)}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all inline-flex items-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl aspect-[4/3]">
              <img
                src={flagshipSofa.image}
                alt="Modern 3-Seater Sofa"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
