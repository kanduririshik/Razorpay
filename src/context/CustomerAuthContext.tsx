"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isGuest?: boolean;
}

interface CustomerAuthContextType {
  customer: CustomerSession | null;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => boolean;
  guestLogin: () => void;
  logout: () => void;
  updateCustomer: (data: Partial<CustomerSession>) => void;
}

const STORAGE_KEY = "slanders_customer_session";

const DEFAULT_CUSTOMER: CustomerSession = {
  id: "cust_rahul_01",
  name: "Rahul Sharma",
  email: "rahul.sharma@gmail.com",
  phone: "+91 98201 45892",
  address: "Flat 402, Lotus Heights, 12th Main, Indiranagar, Bengaluru - 560038",
};

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCustomer(JSON.parse(stored));
      } else {
        // Preload default customer session for seamless demo experience
        setCustomer(DEFAULT_CUSTOMER);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMER));
      }
    } catch {
      setCustomer(DEFAULT_CUSTOMER);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (email: string) => {
    const session: CustomerSession = {
      ...DEFAULT_CUSTOMER,
      email: email || DEFAULT_CUSTOMER.email,
      isGuest: false,
    };
    setCustomer(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {}
    return true;
  };

  const guestLogin = () => {
    const guestSession: CustomerSession = {
      ...DEFAULT_CUSTOMER,
      isGuest: true,
    };
    setCustomer(guestSession);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guestSession));
    } catch {}
  };

  const logout = () => {
    setCustomer(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const updateCustomer = (data: Partial<CustomerSession>) => {
    setCustomer((prev) => {
      const updated = prev ? { ...prev, ...data } : { ...DEFAULT_CUSTOMER, ...data };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: Boolean(customer),
        login,
        guestLogin,
        logout,
        updateCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
