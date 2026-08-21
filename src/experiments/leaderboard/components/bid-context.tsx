"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { centsToDollars } from "@/lib/utils";

type BidContextValue = {
  amountDollars: number;
  setAmountDollars: (value: number) => void;
  takePlace: (amountCents: number) => void;
};

const BidContext = createContext<BidContextValue | null>(null);

export function BidProvider({
  initialAmountCents,
  prefillAmount,
  children,
}: {
  initialAmountCents: number;
  prefillAmount: number | null;
  children: ReactNode;
}) {
  const [amountDollars, setAmountDollars] = useState(
    prefillAmount ?? centsToDollars(initialAmountCents),
  );

  const takePlace = useCallback((amountCents: number) => {
    setAmountDollars(centsToDollars(amountCents));
    document.getElementById("subir")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      document.getElementById("identifier")?.focus();
    }, 250);
  }, []);

  const value = useMemo(
    () => ({ amountDollars, setAmountDollars, takePlace }),
    [amountDollars, takePlace],
  );

  return <BidContext.Provider value={value}>{children}</BidContext.Provider>;
}

export function useBid() {
  const ctx = useContext(BidContext);
  if (!ctx) throw new Error("useBid must be used within BidProvider");
  return ctx;
}
