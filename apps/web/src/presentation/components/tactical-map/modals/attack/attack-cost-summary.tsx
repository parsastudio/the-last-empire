import React from "react";
import { Coins, Wallet, Anchor, Swords, ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface AttackCostSummaryProps {
  totalLogisticsCost: number;
  currentTreasury: number;
  canAfford: boolean;
  hasSelectedInfantry: boolean;
  isSubmitting: boolean;
  targetRegionName: string;
  isLandNeighbor: boolean;
  isNavalValid?: boolean;
  hasNavalCapacity?: boolean;
  hasAlreadyAttackedThisTurn?: boolean;
  attackType?: "LAND" | "NAVAL";
  onExecute: () => void;
}

export function AttackCostSummary({
  totalLogisticsCost,
  currentTreasury,
  canAfford,
  hasSelectedInfantry,
  isSubmitting,
  isLandNeighbor,
  isNavalValid = false,
  hasNavalCapacity = true,
  hasAlreadyAttackedThisTurn = false,
  attackType = "LAND",
  onExecute,
}: AttackCostSummaryProps) {
  const isAccessible = isLandNeighbor || isNavalValid;
  const isButtonDisabled =
    !isAccessible ||
    !hasSelectedInfantry ||
    !canAfford ||
    !hasNavalCapacity ||
    hasAlreadyAttackedThisTurn ||
    isSubmitting;

  const isNaval = attackType === "NAVAL";

  return (
    <div className="space-y-3.5 pt-2 border-t border-border/60 dir-rtl text-right font-sans">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl space-y-3 font-mono text-xs shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <span className="text-[11px] font-bold text-foreground font-sans flex items-center gap-1.5">
            <Coins size={14} className="text-gdp" />
            صورت‌حساب لجستیک و پشتیبانی تهاجم
          </span>
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-sans">
            <Wallet size={12} className="text-primary" />
            <span>موجودی خزانه:</span>
            <span className="font-mono font-bold text-foreground">
              {PersianNumberFormatter.formatCurrency(currentTreasury)}
            </span>
          </div>
        </div>

        <div className="bg-background/60 p-3 rounded-2xl border border-border/40 flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-sans flex items-center gap-1.5">
            {isNaval ? (
              <Anchor size={13} className="text-gdp" />
            ) : (
              <Coins size={13} className="text-gdp" />
            )}
            {isNaval
              ? "مخارج ترابری دریایی و لجستیک:"
              : "هزینه اعزام تا مرز (لجستیک زمینی):"}
          </span>
          <span
            className={`font-bold text-sm ${canAfford ? "text-gdp" : "text-military"}`}
          >
            {PersianNumberFormatter.formatCurrency(totalLogisticsCost)}
          </span>
        </div>
      </div>

      {!canAfford && (
        <div className="p-3 bg-military/15 border border-military/30 rounded-2xl flex items-center gap-2 text-xs text-military">
          <ShieldAlert size={15} className="shrink-0" />
          <span>
            موجودی خزانه برای پوشش کامل مخارج لجستیکی این تهاجم کافی نیست.
          </span>
        </div>
      )}

      {isNaval && !hasNavalCapacity && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-400">
          <Anchor size={15} className="shrink-0" />
          <span>
            تعداد ناوگان فعال شما پاسخگوی ترابری این حجم از ادوات زمینی نیست.
          </span>
        </div>
      )}

      <button
        onClick={onExecute}
        disabled={isButtonDisabled}
        className="w-full py-4 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-black text-xs transition-all cursor-pointer shadow-xl shadow-military/20 flex items-center justify-center gap-2 hover:scale-[1.005] active:scale-[0.995]"
      >
        {isNaval ? <Anchor size={16} /> : <Swords size={16} />}
        <span>
          {isSubmitting
            ? "در حال ثبت دستور و گسیل ارتش..."
            : hasAlreadyAttackedThisTurn
              ? "تهاجم مجدد در این نوبت مجاز نیست"
              : !isAccessible
                ? "عدم امکان دسترسی به منطقه تهاجم"
                : isNaval && !hasNavalCapacity
                  ? "ظرفیت ترابری ناوگان دریایی ناکافی است"
                  : !hasSelectedInfantry
                    ? "حداقل ۱ لشکر پیاده‌نظام الزامی است"
                    : !canAfford
                      ? "موجودی خزانه ناکافی است"
                      : isNaval
                        ? `صدور فرمان هجوم دریایی • ${PersianNumberFormatter.formatCurrency(totalLogisticsCost)}`
                        : `صدور فرمان تهاجم زمینی • ${PersianNumberFormatter.formatCurrency(totalLogisticsCost)}`}
        </span>
      </button>
    </div>
  );
}
