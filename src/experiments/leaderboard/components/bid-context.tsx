"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  children,
}: {
  initialAmountCents: number;
  children: ReactNode;
}) {
  const [amountDollars, setAmountDollars] = useState(() =>
    centsToDollars(initialAmountCents),
  );

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("amount");
    if (raw && /^\d+$/.test(raw)) {
      setAmountDollars(Math.max(1, Number(raw)));
    }
  }, []);

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
