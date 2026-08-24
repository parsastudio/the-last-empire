import React from "react";
import { Coins, Zap } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

interface ArmsOrderSummaryProps {
  unitPrice: number;
  totalPrice: number;
  quantity: number;
  canAfford: boolean;
  isSubmitting: boolean;
  isSellerTechEligible: boolean;
  isNavalBlockaded: boolean;
  onQuantityChange: (qty: number) => void;
  onBuyArms: () => void;
}

export function ArmsOrderSummary({
  unitPrice,
  totalPrice,
  quantity,
  canAfford,
  isSubmitting,
  isSellerTechEligible,
  isNavalBlockaded,
  onQuantityChange,
  onBuyArms,
}: ArmsOrderSummaryProps) {
  return (
    <div className="space-y-4 pt-2 border-t border-border/40 font-mono text-xs">
      <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl space-y-3 font-sans">
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
            مبلغ کل سفارش:
          </span>
          <span className="font-extrabold text-gdp text-base flex items-center gap-1">
            <Coins size={16} />
            {PersianNumberFormatter.formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-sans">
            تعداد سفارش خرید:
          </span>
          <span className="font-bold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              quantity.toLocaleString("en-US"),
            )}{" "}
            یگان
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="50"
            value={quantity}
            onChange={(e) => onQuantityChange(Number(e.target.value))}
            className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-secondary rounded-lg"
          />

          <div className="flex items-center gap-1 font-mono">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => onQuantityChange(quantity - 1)}
              className="w-7 h-7 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="200"
              value={quantity}
              onChange={(e) =>
                onQuantityChange(Math.max(1, Number(e.target.value)))
              }
              className="w-14 bg-secondary/80 border border-border/80 rounded-lg py-1 px-1 text-center font-bold text-xs text-foreground font-mono focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-7 h-7 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center justify-center font-bold text-xs text-foreground cursor-pointer shrink-0"
            >
              +
            </button>
          </div>
        </div>

        <PercentageSelector
          options={[
            { pct: 1, label: "۱ یگان" },
            { pct: 5, label: "۵ یگان" },
            { pct: 10, label: "۱۰ یگان" },
            { pct: 25, label: "۲۵ یگان" },
          ]}
          onSelect={(val) => onQuantityChange(val)}
          colorVariant="gdp"
        />
      </div>

      <button
        onClick={onBuyArms}
        disabled={
          !isSellerTechEligible ||
          isNavalBlockaded ||
          !canAfford ||
          isSubmitting
        }
        className="w-full py-4 bg-gdp hover:bg-gdp/90 disabled:opacity-40 text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-gdp/10 flex items-center justify-center gap-2"
      >
        <Zap size={16} />
        <span>
          {isSubmitting
            ? "در حال ثبت سفارش و تحویل فوری..."
            : isNavalBlockaded
              ? "غیرقابل تحویل به دلیل محاصره کامل دریایی"
              : !canAfford
                ? "موجودی خزانه ناکافی جهت خرید"
                : `تایید خرید فوری و تحویل در همین نوبت (${PersianNumberFormatter.formatCurrency(totalPrice)})`}
        </span>
      </button>
    </div>
  );
}
