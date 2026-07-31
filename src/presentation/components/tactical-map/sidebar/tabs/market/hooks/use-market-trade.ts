import { useState, useCallback, useMemo } from "react";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { MarketEngine } from "@/engine/economy/market-engine";

interface UseMarketTradeProps {
  marketPrices?: ResourceMarketPrice;
  oilStock?: number;
  steelStock?: number;
  userTreasury?: number;
  onOpenTradeExternal?: (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => void;
}

export function useMarketTrade({
  marketPrices = { oil: 25000000, steel: 25000000 },
  oilStock = 50,
  steelStock = 20,
  userTreasury = 100000000,
  onOpenTradeExternal,
}: UseMarketTradeProps) {
  const safeOilPrice = marketPrices.oil < 1000000 ? 25000000 : marketPrices.oil;
  const safeSteelPrice =
    marketPrices.steel < 1000000 ? 25000000 : marketPrices.steel;

  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    resourceName: string;
    unit: string;
    mode: "buy" | "sell";
    unitPrice: number;
    maxAmount: number;
  }>({
    isOpen: false,
    resourceName: "",
    unit: "بلوک استراتژیک",
    mode: "buy",
    unitPrice: 25000000,
    maxAmount: 10,
  });

  const oilTrend: "up" | "down" | "stable" = useMemo(
    () =>
      safeOilPrice > 25000000
        ? "up"
        : safeOilPrice < 25000000
          ? "down"
          : "stable",
    [safeOilPrice],
  );

  const steelTrend: "up" | "down" | "stable" = useMemo(
    () =>
      safeSteelPrice > 25000000
        ? "up"
        : safeSteelPrice < 25000000
          ? "down"
          : "stable",
    [safeSteelPrice],
  );

  const handleOpenTrade = useCallback(
    (name: string, unit: string, mode: "buy" | "sell", price: number) => {
      const realPrice = price && price >= 1000000 ? price : 25000000;

      if (onOpenTradeExternal) {
        onOpenTradeExternal(name, unit, mode, realPrice);
        return;
      }

      const isOil = name.includes("نفت");
      const stock = isOil ? oilStock : steelStock;
      const marketEngine = new MarketEngine();
      const maxAffordable = marketEngine.calculateMaxAffordable(
        userTreasury,
        { oil: realPrice, steel: realPrice },
        isOil ? "oil" : "steel",
      );

      const maxAmount = mode === "buy" ? maxAffordable : Math.max(0, stock);

      setTradeModal({
        isOpen: true,
        resourceName: name,
        unit,
        mode,
        unitPrice: realPrice,
        maxAmount,
      });
    },
    [oilStock, steelStock, userTreasury, onOpenTradeExternal],
  );

  const closeTradeModal = useCallback(() => {
    setTradeModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    tradeModal,
    oilTrend,
    steelTrend,
    handleOpenTrade,
    closeTradeModal,
  };
}
