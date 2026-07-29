import React, { useState } from "react";
import { Fuel, Wrench } from "lucide-react";
import { MarketHeader } from "./market-header";
import { CommodityCard } from "./commodity-card";
import { TradeActionDialog } from "./trade-action-dialog";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";

interface MarketTabProps {
  marketPrices?: ResourceMarketPrice;
  oilStock?: number;
  steelStock?: number;
  userTreasury?: number;
}

export function MarketTab({
  marketPrices = { oil: 105, steel: 92 },
  oilStock = 5000,
  steelStock = 2000,
  userTreasury = 100000,
}: MarketTabProps) {
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

  const oilTrend: "up" | "down" | "stable" =
    marketPrices.oil > 100 ? "up" : marketPrices.oil < 100 ? "down" : "stable";

  const steelTrend: "up" | "down" | "stable" =
    marketPrices.steel > 100
      ? "up"
      : marketPrices.steel < 100
        ? "down"
        : "stable";

  const handleOpenTrade = (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => {
    const stock = name.includes("نفت") ? oilStock : steelStock;
    const maxAffordable = Math.max(1, Math.floor(userTreasury / (price * 1.1)));
    const maxAmount =
      mode === "buy" ? Math.min(1000, maxAffordable) : Math.max(1, stock);

    setTradeModal({
      isOpen: true,
      resourceName: name,
      unit,
      mode,
      unitPrice: price,
      maxAmount,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right">
      <MarketHeader />

      <div className="space-y-3">
        <CommodityCard
          title="نفت خام استراتژیک"
          unit="بشکه"
          icon={Fuel}
          colorClass="text-treasury"
          stock={oilStock}
          currentPrice={marketPrices.oil}
          priceTrend={oilTrend}
          onTrade={(mode) =>
            handleOpenTrade("نفت خام", "بشکه", mode, marketPrices.oil)
          }
        />

        <CommodityCard
          title="فولاد صنعتی سنگین"
          unit="تن"
          icon={Wrench}
          colorClass="text-primary"
          stock={steelStock}
          currentPrice={marketPrices.steel}
          priceTrend={steelTrend}
          onTrade={(mode) =>
            handleOpenTrade("فولاد صنعتی", "تن", mode, marketPrices.steel)
          }
        />
      </div>

      <TradeActionDialog
        isOpen={tradeModal.isOpen}
        resourceName={tradeModal.resourceName}
        unit={tradeModal.unit}
        mode={tradeModal.mode}
        unitPrice={tradeModal.unitPrice}
        maxAmount={tradeModal.maxAmount}
        onClose={() => setTradeModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          setTradeModal((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
