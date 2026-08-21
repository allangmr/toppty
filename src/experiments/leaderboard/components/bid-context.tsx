"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { centsToDollars } from "@/lib/utils";

type BidContextValue = {
  amountDollars: number;
  setAmountDollars: (value: number) => void;
  takePlace: (amountCents: number) => void;
};

const BidContext = createContext<BidContextValue | null>(null);

function readAmountParam(): number | null {
  const raw = new URLSearchParams(window.location.search).get("amount");
  if (raw && /^\d+$/.test(raw)) return Math.max(1, Number(raw));
  return null;
}

function subscribeSearch(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

export function BidProvider({
  initialAmountCents,
  children,
}: {
  initialAmountCents: number;
  children: ReactNode;
}) {
  const urlAmount = useSyncExternalStore(
    subscribeSearch,
    readAmountParam,
    () => null,
  );
  const [manualAmount, setManualAmount] = useState<number | null>(null);
  const amountDollars =
    manualAmount ?? urlAmount ?? centsToDollars(initialAmountCents);

  const setAmountDollars = useCallback((value: number) => {
    setManualAmount(value);
  }, []);

  const takePlace = useCallback((amountCents: number) => {
    setManualAmount(centsToDollars(amountCents));
    document.getElementById("subir")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      document.getElementById("identifier")?.focus();
    }, 250);
  }, []);

  const value = useMemo(
    () => ({
      amountDollars,
      setAmountDollars,
      takePlace,
    }),
    [amountDollars, setAmountDollars, takePlace],
  );

  return <BidContext.Provider value={value}>{children}</BidContext.Provider>;
}

export function useBid() {
  const ctx = useContext(BidContext);
  if (!ctx) throw new Error("useBid must be used within BidProvider");
  return ctx;
}
