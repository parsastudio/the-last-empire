import React, { useState } from "react";
import { MarketHeader } from "../../sidebar/tabs/market/market-header";
import { CommodityCard } from "../../sidebar/tabs/market/commodity-card";
import { Fuel, Wrench, Coins } from "lucide-react";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { useMarketTrade } from "../../sidebar/tabs/market/hooks/use-market-trade";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { AutoTradeDialog } from "../../sidebar/tabs/market/auto-trade-dialog";
import { Nation } from "@/domain/nation/nation.schema";

interface WideMarketViewProps {
  marketPrices?: ResourceMarketPrice;
  oilStock?: number;
  steelStock?: number;
  userTreasury?: number;
  activeSubTab?: string | null;
  nation?: Nation | null;
  onOpenTrade: (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => void;
}

export function WideMarketView({
  marketPrices = { oil: 25000000, steel: 25000000 },
  oilStock = 50,
  steelStock = 20,
  userTreasury = 100000000,
  nation,
  onOpenTrade,
}: WideMarketViewProps) {
  const [isAutoTradeOpen, setIsAutoTradeOpen] = useState<boolean>(false);

  const safeOil = marketPrices.oil < 1000000 ? 25000000 : marketPrices.oil;
  const safeSteel =
    marketPrices.steel < 1000000 ? 25000000 : marketPrices.steel;

  const trade = useMarketTrade({
    marketPrices: { oil: safeOil, steel: safeSteel },
    oilStock,
    steelStock,
    userTreasury,
    onOpenTradeExternal: onOpenTrade,
  });

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-200 dir-rtl text-right">
        <MarketHeader onOpenAutoTradeModal={() => setIsAutoTradeOpen(true)} />

        <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground font-sans flex items-center gap-1.5">
            <Coins size={14} className="text-gdp" />
            موجودی خزانه ملی جهت معامله:
          </span>
          <span className="font-bold text-gdp text-sm">
            {PersianNumberFormatter.formatCurrency(userTreasury)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CommodityCard
            title="نفت خام استراتژیک"
            unit="بلوک استراتژیک"
            icon={Fuel}
            colorClass="text-treasury"
            stock={oilStock}
            currentPrice={safeOil}
            priceTrend={trade.oilTrend}
            onTrade={(mode) =>
              trade.handleOpenTrade(
                "نفت خام استراتژیک",
                "بلوک استراتژیک",
                mode,
                safeOil,
              )
            }
          />

          <CommodityCard
            title="فولاد صنعتی سنگین"
            unit="بلوک استراتژیک"
            icon={Wrench}
            colorClass="text-primary"
            stock={steelStock}
            currentPrice={safeSteel}
            priceTrend={trade.steelTrend}
            onTrade={(mode) =>
              trade.handleOpenTrade(
                "فولاد صنعتی سنگین",
                "بلوک استراتژیک",
                mode,
                safeSteel,
              )
            }
          />
        </div>
      </div>

      {nation && (
        <AutoTradeDialog
          isOpen={isAutoTradeOpen}
          nationId={nation.id}
          initialSettings={nation.autoTradeSettings}
          onClose={() => setIsAutoTradeOpen(false)}
        />
      )}
    </>
  );
}
