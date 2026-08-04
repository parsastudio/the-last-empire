import { useState, useCallback, useMemo } from "react";
import { MarketEngine } from "@/engine/economy/market-engine";

interface UseMarketTradeProps {
  oilStock?: number;
  steelStock?: number;
  userTreasury?: number;
}

export function useMarketTrade({
  oilStock = 50,
  steelStock = 20,
  userTreasury = 100000000,
}: UseMarketTradeProps = {}) {
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

  const oilTrend: "up" | "down" | "stable" = useMemo(() => "stable", []);
  const steelTrend: "up" | "down" | "stable" = useMemo(() => "stable", []);

  const handleOpenTrade = useCallback(
    (name: string, unit: string, mode: "buy" | "sell", price: number) => {
      const realPrice = price && price >= 1000000 ? price : 25000000;
      const isOil = name.includes("نفت");
      const stock = isOil ? oilStock : steelStock;

      const maxAffordable = MarketEngine.calculateMaxAffordable(
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
    [oilStock, steelStock, userTreasury],
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
