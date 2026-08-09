"use client";

import React, { useState, useCallback } from "react";
import {
  TrendingUp,
  Bot,
  Fuel,
  Coins,
  ShoppingBag,
  TrendingDown,
} from "lucide-react";
import { ResourceMarketPrice } from "@/domain/economy/economy.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { AutoTradeDialog } from "@/presentation/components/tactical-map/sidebar/tabs/market/auto-trade-dialog";
import { Nation } from "@/domain/nation/nation.schema";
import { MARKET_CONFIG } from "@/domain/economy/market.config";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

interface WideMarketViewProps {
  marketPrices?: ResourceMarketPrice;
  oilStock?: number;
  userTreasury?: number;
  nation?: Nation | null;
}

function formatCurrency(value: number): string {
  return PersianNumberFormatter.formatCurrency(value, true);
}

function InlineTradeCard({
  title,
  unit,
  icon: Icon,
  colorClass,
  stock,
  price,
  treasury,
  nationId,
  onTradeComplete,
}: {
  title: string;
  unit: string;
  icon: React.ElementType;
  colorClass: string;
  stock: number;
  price: number;
  treasury: number;
  nationId: string;
  onTradeComplete?: () => void;
}) {
  const [amount, setAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const maxBuy = Math.floor(treasury / price);
  const maxSell = stock;
  const maxAffordable = Math.max(0, maxBuy);
  const currentAmount = Math.min(amount, maxBuy, maxSell);

  const handlePercentageSelect = (pct: number) => {
    const target = Math.floor(Math.max(maxBuy, maxSell) * pct);
    setAmount(target);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) {
      setAmount(0);
      return;
    }
    setAmount(val);
  };

  const executeTrade = async (isBuy: boolean) => {
    const tradeAmount = Math.min(amount, isBuy ? maxBuy : maxSell);
    if (tradeAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const action = ActionFactory.tradeResources(
        nationId,
        "oil",
        isBuy,
        tradeAmount,
      );
      const success = await dispatchAction(
        action,
        `سفارش ${isBuy ? "خرید" : "فروش"} ${PersianNumberFormatter.toPersianDigits(tradeAmount)} ${unit} ${title} ثبت شد.`,
      );
      if (success) {
        setAmount(0);
        onTradeComplete?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canBuy =
    currentAmount > 0 &&
    currentAmount <= maxBuy &&
    treasury >= currentAmount * price;
  const canSell = currentAmount > 0 && currentAmount <= maxSell;

  return (
    <div className="bg-background/40 border border-border/60 rounded-2xl p-5 space-y-4 dir-rtl text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon size={18} className={colorClass} />
          <div>
            <span className="text-sm font-bold text-foreground">{title}</span>
            <span className="text-[10px] text-muted-foreground font-mono block">
              {unit} · هر بلوک = ۱۰ میلیون بشکه
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-md font-bold bg-secondary text-muted-foreground border border-border/50">
          نرخ ثابت
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs font-mono">
        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-[9px] text-muted-foreground block font-sans">
            موجودی انبار
          </span>
          <span className="font-bold text-foreground block">
            {PersianNumberFormatter.toPersianDigits(
              stock.toLocaleString("en-US"),
            )}{" "}
            {unit}
          </span>
        </div>
        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-[9px] text-muted-foreground block font-sans">
            قیمت خرید
          </span>
          <span className="font-bold text-gdp block">
            {formatCurrency(price)}
          </span>
        </div>
        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-[9px] text-muted-foreground block font-sans">
            قیمت فروش
          </span>
          <span className="font-bold text-treasury block">
            {formatCurrency(MARKET_CONFIG.FIXED_SELL_PRICE)}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-1 border-t border-border/40">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-sans">مقدار معامله:</span>
          <span className="font-bold text-foreground font-mono">
            {PersianNumberFormatter.toPersianDigits(
              currentAmount.toLocaleString("en-US"),
            )}{" "}
            {unit}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={Math.max(maxBuy, maxSell, 1)}
            value={currentAmount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg"
          />
          <input
            type="number"
            min={0}
            max={Math.max(maxBuy, maxSell)}
            value={currentAmount}
            onChange={handleInputChange}
            className="w-20 bg-secondary/80 border border-border/80 rounded-lg py-1.5 px-2 text-center font-bold text-xs text-foreground font-mono focus:outline-none focus:border-primary"
          />
        </div>

        <PercentageSelector
          disabled={Math.max(maxBuy, maxSell) === 0}
          onSelect={handlePercentageSelect}
          colorVariant="gdp"
        />

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => executeTrade(true)}
            disabled={!canBuy || isSubmitting}
            className="py-2.5 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>
              {isSubmitting
                ? "در حال ثبت..."
                : `خرید ${currentAmount > 0 ? PersianNumberFormatter.toPersianDigits(currentAmount) : ""}`}
            </span>
          </button>
          <button
            onClick={() => executeTrade(false)}
            disabled={!canSell || isSubmitting}
            className="py-2.5 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground border border-border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <TrendingDown size={14} className="text-treasury" />
            <span>
              {isSubmitting
                ? "در حال ثبت..."
                : `فروش ${currentAmount > 0 ? PersianNumberFormatter.toPersianDigits(currentAmount) : ""}`}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans pt-1 border-t border-border/30">
          <span>
            حداکثر خرید: {PersianNumberFormatter.toPersianDigits(maxBuy)} {unit}
          </span>
          <span>
            حداکثر فروش: {PersianNumberFormatter.toPersianDigits(maxSell)}{" "}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

export function WideMarketView({
  marketPrices,
  oilStock = 50,
  userTreasury = MARKET_CONFIG.DEFAULT_TREASURY_FALLBACK,
  nation,
}: WideMarketViewProps) {
  const [isAutoTradeOpen, setIsAutoTradeOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const safeOil = marketPrices?.oil ?? MARKET_CONFIG.FIXED_BUY_PRICE;

  const handleTradeComplete = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <>
      <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gdp/10 border border-gdp/20">
              <TrendingUp size={18} className="text-gdp" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground tracking-tight">
                بورس بین‌المللی انرژی
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                معامله مستقیم بلوک‌های کلان نفت خام در بازار آزاد جهانی
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAutoTradeOpen(true)}
            className="px-4 py-2 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Bot size={16} />
            <span>تنظیمات بازرگانی خودکار</span>
          </button>
        </div>

        <div className="bg-secondary/50 border border-border/70 p-3.5 rounded-2xl flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground font-sans font-bold flex items-center gap-2">
            <Coins size={16} className="text-gdp" />
            موجودی خزانه ملی جهت معامله:
          </span>
          <span className="font-extrabold text-gdp text-sm">
            {formatCurrency(userTreasury)}
          </span>
        </div>

        <InlineTradeCard
          key={`oil-${refreshKey}`}
          title="نفت خام استراتژیک"
          unit="بلوک"
          icon={Fuel}
          colorClass="text-treasury"
          stock={oilStock}
          price={safeOil}
          treasury={userTreasury}
          nationId={nation?.id ?? ""}
          onTradeComplete={handleTradeComplete}
        />
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
