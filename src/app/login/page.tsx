"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Armchair, ArrowRight, UserCheck, ShieldCheck } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/shop";

  const { login, guestLogin } = useCustomerAuth();
  const [email, setEmail] = useState("rahul.sharma@gmail.com");
  const [password, setPassword] = useState("••••••••");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    router.push(redirectPath);
  };

  const handleGuest = () => {
    guestLogin();
    router.push(redirectPath);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Armchair className="w-6 h-6" />
          </div>
          <p className="text-[11px] font-mono tracking-widest text-amber-400 uppercase">
            SLANDER&apos;S FURNITURE STORE
          </p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Welcome to Slander&apos;s
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to continue shopping our handcrafted luxury collection.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300 block uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] flex items-center justify-center space-x-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-slate-900 px-3 text-slate-500">Or</span>
          </div>
        </div>

        <button
          onClick={handleGuest}
          className="w-full py-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 font-medium rounded-xl text-xs transition-colors flex items-center justify-center space-x-2"
        >
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>Continue as Guest</span>
        </button>

        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure checkout with Razorpay Standard Gateway</span>
        </div>
      </div>
    </div>
  );
}
