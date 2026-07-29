import React from "react";
import { MarketHeader } from "../../sidebar/tabs/market/market-header";
import { CommodityCard } from "../../sidebar/tabs/market/commodity-card";
import { Fuel, Wrench } from "lucide-react";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";

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
  const oilTrend: "up" | "down" | "stable" =
    marketPrices.oil > 100 ? "up" : marketPrices.oil < 100 ? "down" : "stable";

  const steelTrend: "up" | "down" | "stable" =
    marketPrices.steel > 100
      ? "up"
      : marketPrices.steel < 100
        ? "down"
        : "stable";

  return (
    <div className="space-y-6 animate-in fade-in duration-200 dir-rtl text-right">
      <MarketHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CommodityCard
          title="نفت خام استراتژیک"
          unit="بشکه"
          icon={Fuel}
          colorClass="text-treasury"
          stock={oilStock}
          currentPrice={marketPrices.oil}
          priceTrend={oilTrend}
          onTrade={(mode) =>
            onOpenTrade("نفت خام", "بشکه", mode, marketPrices.oil)
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
            onOpenTrade("فولاد صنعتی", "تن", mode, marketPrices.steel)
          }
        />
      </div>
    </div>
  );
}
