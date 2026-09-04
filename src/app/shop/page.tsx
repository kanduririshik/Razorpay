"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FURNITURE_PRODUCTS,
  FurnitureProduct,
} from "@/lib/data/initialData";
import { useDemoData } from "@/context/DemoDataContext";
import { formatINR } from "@/lib/utils";
import {
  ShoppingBag,
  Star,
  Check,
  ChevronRight,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

function ShopCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("cat") || "ALL";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart } = useDemoData();

  const categories = ["ALL", "Living Room", "Bedroom", "Dining Room", "Storage", "Home Office"];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "ALL") return FURNITURE_PRODUCTS;
    return FURNITURE_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const handleAddToCart = (product: FurnitureProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-amber-400">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-200">Catalog</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
              Handcrafted Furniture Catalog
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Showing {filteredProducts.length} artisanal pieces designed for modern living.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono">Featured Design:</span>
            <button
              onClick={() => router.push("/checkout")}
              className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition-colors"
            >
              Modern 3-Seater Sofa (₹32,999)
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800/80">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat === "ALL" ? "All Pieces" : cat}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredProducts.map((prod) => {
          const isAdded = addedId === prod.id;
          const isFlagship = prod.id === "prod_sofa_01";

          return (
            <div
              key={prod.id}
              onClick={() => router.push(`/product/${prod.id}`)}
              className={`group bg-slate-900/80 hover:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                isFlagship
                  ? "border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
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
                    <span className="px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-200 text-[10px] font-mono border border-slate-700">
                      {prod.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-semibold flex items-center space-x-1 border border-slate-800">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{prod.rating}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {prod.name}
                  </h3>

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
                      addToCart(prod, 1);
                      router.push("/checkout");
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
    </div>
  );
}

export default function ShopCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 font-mono text-sm">
          Loading catalog...
        </div>
      }
    >
      <ShopCatalogContent />
    </Suspense>
  );
}
