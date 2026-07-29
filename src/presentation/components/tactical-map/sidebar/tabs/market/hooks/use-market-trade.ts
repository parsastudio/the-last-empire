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
  marketPrices = { oil: 105, steel: 92 },
  oilStock = 5000,
  steelStock = 2000,
  userTreasury = 100000,
  onOpenTradeExternal,
}: UseMarketTradeProps) {
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
    unit: "",
    mode: "buy",
    unitPrice: 100,
    maxAmount: 100,
  });

  const oilTrend: "up" | "down" | "stable" = useMemo(
    () =>
      marketPrices.oil > 100
        ? "up"
        : marketPrices.oil < 100
          ? "down"
          : "stable",
    [marketPrices.oil],
  );

  const steelTrend: "up" | "down" | "stable" = useMemo(
    () =>
      marketPrices.steel > 100
        ? "up"
        : marketPrices.steel < 100
          ? "down"
          : "stable",
    [marketPrices.steel],
  );

  const handleOpenTrade = useCallback(
    (name: string, unit: string, mode: "buy" | "sell", price: number) => {
      if (onOpenTradeExternal) {
        onOpenTradeExternal(name, unit, mode, price);
        return;
      }

      const isOil = name.includes("نفت");
      const stock = isOil ? oilStock : steelStock;
      const currentPrice = price || 100;
      const marketEngine = new MarketEngine();
      const maxAffordable = marketEngine.calculateMaxAffordable(
        userTreasury,
        { oil: currentPrice, steel: currentPrice },
        isOil ? "oil" : "steel",
      );

      const maxAmount = mode === "buy" ? maxAffordable : Math.max(0, stock);

      setTradeModal({
        isOpen: true,
        resourceName: name,
        unit,
        mode,
        unitPrice: price,
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
