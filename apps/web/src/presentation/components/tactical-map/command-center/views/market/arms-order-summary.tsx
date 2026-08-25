import React from "react";
import { Coins, Zap, ShieldAlert, Wallet } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

interface ArmsOrderSummaryProps {
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  maxAffordable: number;
  treasury: number;
  canAfford: boolean;
  isSubmitting: boolean;
  isSellerTechEligible: boolean;
  isNavalBlockaded: boolean;
  onQuantityChange: (qty: number) => void;
  onPercentageSelect: (pct: number) => void;
  onBuyArms: () => void;
}

export function ArmsOrderSummary({
  unitPrice,
  totalPrice,
  quantity,
  maxAffordable,
  treasury,
  canAfford,
  isSubmitting,
  isSellerTechEligible,
  isNavalBlockaded,
  onQuantityChange,
  onPercentageSelect,
  onBuyArms,
}: ArmsOrderSummaryProps) {
  const isPurchaseBlocked =
    !isSellerTechEligible ||
    isNavalBlockaded ||
    maxAffordable === 0 ||
    !canAfford ||
    quantity <= 0 ||
    isSubmitting;

  return (
    <div className="space-y-4 pt-2 border-t border-border/40 font-mono text-xs dir-rtl text-right">
      <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-3 font-sans">
        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-border/40">
          <span className="text-muted-foreground font-sans flex items-center gap-1.5">
            <Wallet size={13} className="text-primary" />
            موجودی خزانه کشور شما:
          </span>
          <span className="font-bold text-foreground text-xs">
            {PersianNumberFormatter.formatCurrency(treasury)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            قیمت خرید فوری هر یگان (۲ برابر هزینه ساخت):
          </span>
          <span className="font-bold text-gdp text-sm">
            {PersianNumberFormatter.formatCurrency(unitPrice)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            مبلغ کل سفارش خرید:
          </span>
          <span className="font-extrabold text-gdp text-base flex items-center gap-1">
            <Coins size={16} />
            {PersianNumberFormatter.formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            حداکثر سقف خرید با بودجه فعلی:
          </span>
          <span className="font-bold text-gdp text-xs">
            {PersianNumberFormatter.toPersianDigits(
              maxAffordable.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <div className="space-y-2 bg-background/50 p-3.5 rounded-2xl border border-border/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-sans">
              تعداد سفارش واردات:
            </span>
            <span className="font-bold text-foreground text-sm font-mono">
              {PersianNumberFormatter.toPersianDigits(
                quantity.toLocaleString("en-US"),
              )}{" "}
              یگان
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min={maxAffordable > 0 ? 1 : 0}
              max={Math.max(0, maxAffordable)}
              disabled={maxAffordable === 0}
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value))}
              className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg disabled:opacity-30"
            />

            <div className="flex items-center gap-1 font-mono">
              <button
                type="button"
                disabled={quantity <= 1 || maxAffordable === 0}
                onClick={() => onQuantityChange(quantity - 1)}
                className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
              >
                -
              </button>
              <input
                type="number"
                min={maxAffordable > 0 ? 1 : 0}
                max={Math.max(0, maxAffordable)}
                disabled={maxAffordable === 0}
                value={quantity}
                onChange={(e) =>
                  onQuantityChange(
                    Math.max(
                      0,
                      Math.min(maxAffordable, Number(e.target.value)),
                    ),
                  )
                }
                className="w-16 bg-secondary/80 border border-border/80 rounded-lg py-1 px-1 text-center font-bold text-xs text-foreground font-mono focus:outline-none focus:border-primary disabled:opacity-30"
              />
              <button
                type="button"
                disabled={quantity >= maxAffordable || maxAffordable === 0}
                onClick={() => onQuantityChange(quantity + 1)}
                className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
              >
                +
              </button>
            </div>
          </div>

          <PercentageSelector
            disabled={maxAffordable === 0}
            onSelect={onPercentageSelect}
            colorVariant="gdp"
          />
        </div>
      </div>

      {maxAffordable === 0 && (
        <div className="p-3 bg-military/15 border border-military/30 rounded-2xl flex items-center gap-2 text-xs text-military font-sans">
          <ShieldAlert size={15} className="shrink-0" />
          <span>
            موجودی خزانه ملی برای واردات حتی ۱ یگان از این تجهیزات کافی نیست.
          </span>
        </div>
      )}

      <button
        onClick={onBuyArms}
        disabled={isPurchaseBlocked}
        className="w-full py-4 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-50 text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-gdp/20 flex items-center justify-center gap-2 border border-gdp/30"
      >
        <Zap size={16} />
        <span>
          {isSubmitting
            ? "در حال ثبت سفارش و تحویل فوری..."
            : isNavalBlockaded
              ? "غیرقابل تحویل به دلیل محاصره کامل دریایی"
              : !isSellerTechEligible
                ? "سطح فناوری صادرکننده ناکافی است"
                : maxAffordable === 0 || !canAfford
                  ? "موجودی خزانه ناکافی جهت خرید"
                  : `تایید خرید فوری و تحویل در همین نوبت (${PersianNumberFormatter.formatCurrency(totalPrice)})`}
        </span>
      </button>
    </div>
  );
}
