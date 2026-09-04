"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FURNITURE_PRODUCTS, FurnitureProduct } from "@/lib/data/initialData";
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
  ChevronRight,
  Award,
  Layers,
  Wrench,
  Clock,
} from "lucide-react";

export default function FurnitureHomePage() {
  const router = useRouter();
  const { addToCart } = useDemoData();
  const [addedId, setAddedId] = useState<string | null>(null);

  const flagshipSofa = FURNITURE_PRODUCTS[0];
  const bestSellers = FURNITURE_PRODUCTS.slice(0, 4);
  const livingRoomItems = FURNITURE_PRODUCTS.filter(
    (p) => p.category === "Living Room"
  );
  const diningItems = FURNITURE_PRODUCTS.filter(
    (p) => p.category === "Dining Room"
  );
  const bedroomItems = FURNITURE_PRODUCTS.filter(
    (p) => p.category === "Bedroom" || p.category === "Storage"
  );

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
    <div className="space-y-20 pb-16">
      {/* ── 1. Hero Section ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[560px]">
            {/* Left Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6 z-10">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>SLANDER&apos;S FURNITURE STORE • AUTUMN 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.12]">
                Designed for the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400">
                  way you live.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed font-light">
                Timeless furniture crafted for modern Indian homes. From kiln-dried solid Burma teakwood to plush Belgian linen upholstery, every silhouette is precision engineered for generations of warmth and comfort.
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
                <Link
                  href="/shop"
                  className="px-7 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] flex items-center space-x-2.5"
                >
                  <ShoppingBag className="w-4 h-4 text-slate-950" />
                  <span>ENTER STORE</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <a
                  href="#featured"
                  className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors"
                >
                  EXPLORE COLLECTION
                </a>
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-6 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Free White-Glove Setup</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>10-Year Solid Wood Warranty</span>
                </div>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5 h-full min-h-[380px] lg:min-h-[560px] relative">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
                alt="Modern 3-Seater Sofa in architectural living room"
                className="w-full h-full object-cover object-center absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>

              {/* Float badge */}
              <div className="absolute bottom-6 right-6 bg-slate-950/90 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    4.9★
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Modern 3-Seater Sofa</p>
                    <p className="text-[11px] text-slate-400">128+ verified homeowner reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Featured Collection (Flagship Item) ──────────────────────── */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-widest mb-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Architectural Masterpiece</span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
              Featured Flagship Collection
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Curated focal pieces handcrafted for refined comfort and durability.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>View All Collections</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Flagship Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xl">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden relative group">
            <img
              src={flagshipSofa.image}
              alt={flagshipSofa.name}
              className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-full font-mono">
              FLAGSHIP • 18% OFF
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Living Room • Solid Wood Series
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                {flagshipSofa.name}
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-300 font-semibold">{flagshipSofa.rating}</span>
                <span className="text-xs text-slate-500">({flagshipSofa.reviewsCount} customer reviews)</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {flagshipSofa.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Dimensions</span>
                <span className="font-semibold text-slate-200">{flagshipSofa.dimensions}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block">Material</span>
                <span className="font-semibold text-slate-200">{flagshipSofa.material}</span>
              </div>
            </div>

            <div className="flex items-baseline space-x-4 pt-2 border-t border-slate-800/80">
              <span className="text-3xl font-bold text-amber-400 font-mono">
                {formatINR(flagshipSofa.price)}
              </span>
              <span className="text-base line-through text-slate-500 font-mono">
                {formatINR(flagshipSofa.originalPrice)}
              </span>
              <span className="text-xs text-emerald-400 font-mono">Includes pan-India white glove setup</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handleInstantBuy(flagshipSofa)}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Instant Checkout</span>
              </button>
              <button
                onClick={(e) => handleAddToCart(flagshipSofa, e)}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors flex items-center space-x-2"
              >
                {addedId === flagshipSofa.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <Link
                href={`/product/${flagshipSofa.id}`}
                className="px-4 py-3.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
              >
                View Full Specs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Best Sellers Grid ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
              Curated Bestsellers
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Most Loved Pieces
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-1"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/product/${product.id}`)}
              className="group bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-950">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-amber-300 border border-slate-800 text-[10px] font-mono">
                  {product.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="font-semibold text-slate-200">{product.rating}</span>
                    <span className="text-slate-500">({product.reviewsCount})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div>
                    <span className="text-lg font-bold text-white font-mono">
                      {formatINR(product.price)}
                    </span>
                    <span className="text-xs line-through text-slate-500 font-mono ml-2">
                      {formatINR(product.originalPrice)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 transition-all border border-amber-500/20"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Room Categories (Living, Bedroom, Dining) ─────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block mb-1">
            Browse By Space
          </span>
          <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
            Furnish Every Room with Intention
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Explore complete suites designed with cohesive architectural geometry, natural woods, and custom fabrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Living Room */}
          <Link
            href="/shop?cat=living"
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-800"
          >
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
              alt="Living Room Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
                {livingRoomItems.length} Products Available
              </span>
              <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
                Living Room
              </h3>
              <p className="text-xs text-slate-300 mt-1">Deep lounging sofas, accent armchairs, &amp; coffee tables.</p>
            </div>
          </Link>

          {/* Bedroom */}
          <Link
            href="/shop?cat=bedroom"
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-800"
          >
            <img
              src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
              alt="Bedroom Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
                {bedroomItems.length} Products Available
              </span>
              <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
                Bedroom &amp; Storage
              </h3>
              <p className="text-xs text-slate-300 mt-1">Platform beds, nightstands, and engineered wardrobes.</p>
            </div>
          </Link>

          {/* Dining */}
          <Link
            href="/shop?cat=dining"
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-slate-800"
          >
            <img
              src="https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80"
              alt="Dining Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
                {diningItems.length} Products Available
              </span>
              <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
                Dining Room
              </h3>
              <p className="text-xs text-slate-300 mt-1">Solid oak dining tables and cushioned ergonomics.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 5. Premium Materials & Craftsmanship ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest block">
              Architectural Pedigree
            </span>
            <h2 className="text-3xl font-serif font-bold text-white">
              Raw Natural Materials. Uncompromising Joinery.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              We reject synthetic laminates, weak particle boards, and flimsy veneers. Every piece is constructed from FSC-certified hardwoods seasoned to optimal moisture levels to resist warping in Indian climates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Seasoned Teakwood</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kiln-dried Burma teak frames boasting high natural oil content for termite resistance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Acoustic Belgian Linen</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                40,000+ Martindale rub count fabrics with natural spill-resistant molecular finishes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Mortise &amp; Tenon Joinery</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Traditional interlocking wood joinery reinforced with concealed aerospace-grade hardware.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Multi-Stage Hand Buffing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Non-toxic organic linseed oil sealants that allow wood grain patinas to mature gracefully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Pan-India Delivery & Customer Promise ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Pan-India White Glove Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our trained furniture technicians unpack, inspect, and fully assemble every piece inside your chosen room.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">10-Year Structural Warranty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete coverage against timber defects, frame joints, and spring suspension failures with direct in-home service.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">100-Day In-Home Trial</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live with the furniture in your own light and space. If it isn&apos;t a perfect fit, enjoy hassle-free returns.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. Bottom CTA ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 border border-amber-500/30 p-8 sm:p-12 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Ready to Furnish Your Space?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-light">
            Visit our Indiranagar flagship studio or order online with complete peace of mind.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <span>ENTER STORE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
