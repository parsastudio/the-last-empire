import React from "react";
import { Fuel, Wrench } from "lucide-react";
import { MarketHeader } from "./market-header";
import { CommodityCard } from "./commodity-card";
import { TradeActionDialog } from "./trade-action-dialog";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { useMarketTrade } from "./hooks/use-market-trade";

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
  const trade = useMarketTrade({
    marketPrices,
    oilStock,
    steelStock,
    userTreasury,
  });

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
          priceTrend={trade.oilTrend}
          onTrade={(mode) =>
            trade.handleOpenTrade("نفت خام", "بشکه", mode, marketPrices.oil)
          }
        />

        <CommodityCard
          title="فولاد صنعتی سنگین"
          unit="تن"
          icon={Wrench}
          colorClass="text-primary"
          stock={steelStock}
          currentPrice={marketPrices.steel}
          priceTrend={trade.steelTrend}
          onTrade={(mode) =>
            trade.handleOpenTrade("فولاد صنعتی", "تن", mode, marketPrices.steel)
          }
        />
      </div>

      <TradeActionDialog
        isOpen={trade.tradeModal.isOpen}
        resourceName={trade.tradeModal.resourceName}
        unit={trade.tradeModal.unit}
        mode={trade.tradeModal.mode}
        unitPrice={trade.tradeModal.unitPrice}
        maxAmount={trade.tradeModal.maxAmount}
        onClose={trade.closeTradeModal}
        onConfirm={trade.closeTradeModal}
      />
    </div>
  );
}
