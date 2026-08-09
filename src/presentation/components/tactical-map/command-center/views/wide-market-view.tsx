import React, { useState } from "react";
import { TrendingUp, Bot, Fuel, Coins } from "lucide-react";
import { CommodityCard } from "@/presentation/components/tactical-map/sidebar/tabs/market/commodity-card";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { useMarketTrade } from "@/presentation/components/tactical-map/sidebar/tabs/market/hooks/use-market-trade";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { AutoTradeDialog } from "@/presentation/components/tactical-map/sidebar/tabs/market/auto-trade-dialog";
import { TradeActionDialog } from "@/presentation/components/tactical-map/sidebar/tabs/market/trade-action-dialog";
import { Nation } from "@/domain/nation/nation.schema";
import { MARKET_CONFIG } from "@/domain/economy/market.config";

interface WideMarketViewProps {
  marketPrices?: ResourceMarketPrice;
  oilStock?: number;
  userTreasury?: number;
  nation?: Nation | null;
}

export function WideMarketView({
  marketPrices = {
    oil: MARKET_CONFIG.FIXED_BUY_PRICE,
  },
  oilStock = 50,
  userTreasury = MARKET_CONFIG.DEFAULT_TREASURY_FALLBACK,
  nation,
}: WideMarketViewProps) {
  const [isAutoTradeOpen, setIsAutoTradeOpen] = useState<boolean>(false);

  const safeOil =
    marketPrices.oil < 1000000
      ? MARKET_CONFIG.FIXED_BUY_PRICE
      : marketPrices.oil;

  const trade = useMarketTrade({
    oilStock,
    userTreasury,
  });

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-200 dir-rtl text-right">
        <div className="space-y-2 dir-rtl text-right">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-gdp font-mono uppercase tracking-wider">
              <TrendingUp size={14} />
              <span>بورس بین‌المللی بلوک‌های کلان استراتژیک</span>
            </div>

            <button
              onClick={() => setIsAutoTradeOpen(true)}
              className="px-3.5 py-2 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Bot size={15} />
              <span>تنظیمات بازرگانی خودکار</span>
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
            معامله مستقیم بلوک‌های کلان انرژی در بازار آزاد جهانی. نرخ ثابت خرید
            ۲۵ میلیون دلار و نرخ ثابت فروش ۲۰ میلیون دلار تنظیم گردیده است.
          </p>
        </div>

        <div className="bg-secondary/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <Coins size={15} className="text-gdp" />
            موجودی خزانه ملی جهت معامله:
          </span>
          <span className="font-extrabold text-gdp text-sm">
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
            onTrade={(mode) =>
              trade.handleOpenTrade(
                "نفت خام استراتژیک",
                "بلوک استراتژیک",
                mode,
                safeOil,
              )
            }
          />
        </div>
      </div>

      <TradeActionDialog
        isOpen={trade.tradeModal.isOpen}
        resourceName={trade.tradeModal.resourceName}
        unit={trade.tradeModal.unit}
        mode={trade.tradeModal.mode}
        unitPrice={trade.tradeModal.unitPrice}
        maxAmount={trade.tradeModal.maxAmount}
        nationId={nation?.id}
        onClose={trade.closeTradeModal}
        onConfirm={trade.closeTradeModal}
      />

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
