"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  getStoredState,
  saveStoredState,
  resetStoredState,
  getDashboardData as getDashboardDataFromStore,
  queryPayments,
  queryPaymentById,
  queryCustomers,
  queryCustomerById,
  queryRecoveryData,
  queryAnalyticsData,
  queryAgentEvents,
  executeStoreRecovery,
  calculateDashboardMetrics,
  RECOVERAI_STORAGE_KEY,
  addToStoreCart,
  removeFromStoreCart,
  updateStoreCartQuantity,
  clearStoreCart,
  getOrderById,
  processCheckout,
  getStoreAlerts,
  initiateRecoveryAction,
  completeCustomerRecovery as completeCustomerRecoveryInStore,
} from "@/lib/data/store";
import {
  generateInitialDemoData,
  DemoStoreState,
  FurnitureProduct,
  CartItem,
  OrderData,
  AdminAlert,
} from "@/lib/data/initialData";
import { DashboardMetrics } from "@/lib/types";

interface DemoDataContextType {
  isHydrated: boolean;
  store: DemoStoreState;
  metrics: DashboardMetrics;
  cart: CartItem[];
  orders: OrderData[];
  alerts: AdminAlert[];
  getDashboardData: () => ReturnType<typeof getDashboardDataFromStore>;
  getPayments: (options?: Parameters<typeof queryPayments>[1]) => ReturnType<typeof queryPayments>;
  getPaymentById: (id: string) => ReturnType<typeof queryPaymentById>;
  getCustomers: (options?: Parameters<typeof queryCustomers>[1]) => ReturnType<typeof queryCustomers>;
  getCustomerById: (id: string) => ReturnType<typeof queryCustomerById>;
  getRecoveryData: (options?: Parameters<typeof queryRecoveryData>[1]) => ReturnType<typeof queryRecoveryData>;
  getAnalyticsData: (range?: "7D" | "30D" | "90D") => ReturnType<typeof queryAnalyticsData>;
  getAgentEvents: (limit?: number) => ReturnType<typeof queryAgentEvents>;
  recoverPayment: (paymentId: string) => ReturnType<typeof executeStoreRecovery>;
  initiateRecovery: (paymentId: string) => ReturnType<typeof initiateRecoveryAction>;
  completeRecovery: (paymentId: string) => ReturnType<typeof completeCustomerRecoveryInStore>;
  addToCart: (product: FurnitureProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (params: Parameters<typeof processCheckout>[0]) => ReturnType<typeof processCheckout>;
  getOrder: (orderIdOrPaymentId: string) => OrderData | null;
  resetData: () => void;
  refreshData: () => void;
}

const DemoDataContext = createContext<DemoDataContextType | undefined>(undefined);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  // Start with deterministic initial data so SSR and first client render match exactly (no hydration error)
  const [store, setStore] = useState<DemoStoreState>(() => generateInitialDemoData());
  const [isHydrated, setIsHydrated] = useState(false);

  // On mount, hydrate from localStorage
  useEffect(() => {
    const loaded = getStoredState();
    setStore(loaded);
    setIsHydrated(true);

    const handleStoreUpdate = () => {
      const updated = getStoredState();
      setStore(updated);
    };

    window.addEventListener("recoverai_store_updated", handleStoreUpdate);
    window.addEventListener("storage", handleStoreUpdate);

    return () => {
      window.removeEventListener("recoverai_store_updated", handleStoreUpdate);
      window.removeEventListener("storage", handleStoreUpdate);
    };
  }, []);

  const refreshData = useCallback(() => {
    const fresh = getStoredState();
    setStore(fresh);
  }, []);

  const resetData = useCallback(() => {
    const reset = resetStoredState();
    setStore(reset);
  }, []);

  const recoverPayment = useCallback((paymentId: string) => {
    const result = executeStoreRecovery(paymentId);
    const updated = getStoredState();
    setStore(updated);
    return result;
  }, []);

  const initiateRecovery = useCallback((paymentId: string) => {
    const result = initiateRecoveryAction(paymentId);
    const updated = getStoredState();
    setStore(updated);
    return result;
  }, []);

  const completeRecovery = useCallback((paymentId: string) => {
    const result = completeCustomerRecoveryInStore(paymentId);
    const updated = getStoredState();
    setStore(updated);
    return result;
  }, []);

  const addToCart = useCallback((product: FurnitureProduct, quantity = 1) => {
    addToStoreCart(product, quantity);
    const updated = getStoredState();
    setStore(updated);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    removeFromStoreCart(productId);
    const updated = getStoredState();
    setStore(updated);
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    updateStoreCartQuantity(productId, quantity);
    const updated = getStoredState();
    setStore(updated);
  }, []);

  const clearCart = useCallback(() => {
    clearStoreCart();
    const updated = getStoredState();
    setStore(updated);
  }, []);

  const checkout = useCallback((params: Parameters<typeof processCheckout>[0]) => {
    const result = processCheckout(params);
    const updated = getStoredState();
    setStore(updated);
    return result;
  }, []);

  const getOrder = useCallback((orderIdOrPaymentId: string) => {
    return getOrderById(orderIdOrPaymentId);
  }, []);

  const getDashboardData = useCallback(() => {
    return getDashboardDataFromStore(store);
  }, [store]);

  const getPayments = useCallback(
    (options?: Parameters<typeof queryPayments>[1]) => {
      return queryPayments(store, options || {});
    },
    [store]
  );

  const getPaymentById = useCallback(
    (id: string) => {
      return queryPaymentById(store, id);
    },
    [store]
  );

  const getCustomers = useCallback(
    (options?: Parameters<typeof queryCustomers>[1]) => {
      return queryCustomers(store, options || {});
    },
    [store]
  );

  const getCustomerById = useCallback(
    (id: string) => {
      return queryCustomerById(store, id);
    },
    [store]
  );

  const getRecoveryData = useCallback(
    (options?: Parameters<typeof queryRecoveryData>[1]) => {
      return queryRecoveryData(store, options || {});
    },
    [store]
  );

  const getAnalyticsData = useCallback(
    (range: "7D" | "30D" | "90D" = "30D") => {
      return queryAnalyticsData(store, range);
    },
    [store]
  );

  const getAgentEvents = useCallback(
    (limit = 25) => {
      return queryAgentEvents(store, limit);
    },
    [store]
  );

  const metrics = calculateDashboardMetrics(store);

  return (
    <DemoDataContext.Provider
      value={{
        isHydrated,
        store,
        metrics,
        cart: store.cart || [],
        orders: store.orders || [],
        alerts: store.alerts || [],
        getDashboardData,
        getPayments,
        getPaymentById,
        getCustomers,
        getCustomerById,
        getRecoveryData,
        getAnalyticsData,
        getAgentEvents,
        recoverPayment,
        initiateRecovery,
        completeRecovery,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkout,
        getOrder,
        resetData,
        refreshData,
      }}
    >
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error("useDemoData must be used within a DemoDataProvider");
  }
  return context;
}
