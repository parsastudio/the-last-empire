import React, { useState } from "react";
import { Fuel, Wrench } from "lucide-react";
import { MarketHeader } from "./market-header";
import { CommodityCard } from "./commodity-card";
import { TradeActionDialog } from "./trade-action-dialog";

export function MarketTab() {
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

  const handleOpenTrade = (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => {
    setTradeModal({
      isOpen: true,
      resourceName: name,
      unit,
      mode,
      unitPrice: price,
      maxAmount: mode === "buy" ? 200 : 50,
    });
  };

  const handleConfirmTrade = (amount: number) => {
    alert(
      `معامله ${tradeModal.mode === "buy" ? "خرید" : "فروش"} ${amount} ${tradeModal.unit} ${tradeModal.resourceName} با موفقیت در بازار ثبت گردید.`,
    );
    setTradeModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <MarketHeader />

      <div className="space-y-3">
        <CommodityCard
          title="نفت خام استراتژیک"
          unit="بشکه"
          icon={Fuel}
          colorClass="text-treasury"
          stock={5000}
          currentPrice={105}
          priceTrend="up"
          onTrade={(mode) => handleOpenTrade("نفت خام", "بشکه", mode, 105)}
        />

        <CommodityCard
          title="فولاد صنعتی سنگین"
          unit="تن"
          icon={Wrench}
          colorClass="text-primary"
          stock={2000}
          currentPrice={92}
          priceTrend="down"
          onTrade={(mode) => handleOpenTrade("فولاد صنعتی", "تن", mode, 92)}
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
        onConfirm={handleConfirmTrade}
      />
    </div>
  );
}
