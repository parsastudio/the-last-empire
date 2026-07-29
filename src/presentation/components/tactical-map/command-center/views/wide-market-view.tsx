import React from "react";
import { MarketHeader } from "../../sidebar/tabs/market/market-header";
import { CommodityCard } from "../../sidebar/tabs/market/commodity-card";
import { Fuel, Wrench, Coins } from "lucide-react";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { useMarketTrade } from "../../sidebar/tabs/market/hooks/use-market-trade";

interface WideMarketViewProps {
  marketPrices?: ResourceMarketPrice;
  oilStock?: number;
  steelStock?: number;
  userTreasury?: number;
  onOpenTrade: (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => void;
}

export function WideMarketView({
  marketPrices = { oil: 105, steel: 92 },
  oilStock = 5000,
  steelStock = 2000,
  userTreasury = 100000,
  onOpenTrade,
}: WideMarketViewProps) {
  const trade = useMarketTrade({
    marketPrices,
    oilStock,
    steelStock,
    userTreasury,
    onOpenTradeExternal: onOpenTrade,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 dir-rtl text-right">
      <MarketHeader />

      <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl flex items-center justify-between font-mono text-xs">
        <span className="text-muted-foreground font-sans flex items-center gap-1.5">
          <Coins size={14} className="text-gdp" />
          موجودی خزانه ملی جهت معامله:
        </span>
        <span className="font-bold text-gdp text-sm">
          ${userTreasury.toLocaleString("fa-IR")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}
