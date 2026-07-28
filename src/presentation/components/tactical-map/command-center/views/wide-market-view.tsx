import React from "react";
import { MarketHeader } from "../../sidebar/tabs/market/market-header";
import { CommodityCard } from "../../sidebar/tabs/market/commodity-card";
import { Fuel, Wrench } from "lucide-react";

interface WideMarketViewProps {
  onOpenTrade: (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => void;
}

export function WideMarketView({ onOpenTrade }: WideMarketViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <MarketHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CommodityCard
          title="نفت خام استراتژیک"
          unit="بشکه"
          icon={Fuel}
          colorClass="text-treasury"
          stock={5000}
          currentPrice={105}
          priceTrend="up"
          onTrade={(mode) => onOpenTrade("نفت خام", "بشکه", mode, 105)}
        />

        <CommodityCard
          title="فولاد صنعتی سنگین"
          unit="تن"
          icon={Wrench}
          colorClass="text-primary"
          stock={2000}
          currentPrice={92}
          priceTrend="down"
          onTrade={(mode) => onOpenTrade("فولاد صنعتی", "تن", mode, 92)}
        />
      </div>
    </div>
  );
}
