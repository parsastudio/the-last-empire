import React from "react";
import { Coins, Wallet, Anchor, Zap, ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface AttackCostSummaryProps {
  baseDeploymentCost: number;
  navalTransportExtraCost: number;
  isNaval: boolean;
  totalLogisticsCost: number;
  currentTreasury: number;
  canAfford: boolean;
  hasSelectedInfantry: boolean;
  isSubmitting: boolean;
  targetRegionName: string;
  isLandNeighbor: boolean;
  isNavalValid: boolean;
  onExecute: () => void;
}

export function AttackCostSummary({
  baseDeploymentCost,
  navalTransportExtraCost,
  isNaval,
  totalLogisticsCost,
  currentTreasury,
  canAfford,
  hasSelectedInfantry,
  isSubmitting,
  targetRegionName,
  isLandNeighbor,
  isNavalValid,
  onExecute,
}: AttackCostSummaryProps) {
  const isAccessible = isLandNeighbor || isNavalValid;
  const isButtonDisabled =
    !isAccessible || !hasSelectedInfantry || !canAfford || isSubmitting;
  const formattedRegionName = targetRegionName.startsWith("استان")
    ? targetRegionName
    : `استان ${targetRegionName}`;

  return (
    <div className="space-y-3.5 pt-2 border-t border-border/60 dir-rtl text-right font-sans">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <span className="text-[11px] font-bold text-foreground font-sans flex items-center gap-1.5">
            <Coins size={14} className="text-gdp" />
            صورت‌حساب لجیستیک و پشتیبانی تهاجم
          </span>
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-sans">
            <Wallet size={12} className="text-primary" />
            <span>موجودی خزانه:</span>
            <span className="font-mono font-bold text-foreground">
              {PersianNumberFormatter.formatCurrency(currentTreasury)}
            </span>
          </div>
        </div>

        {!isNaval ? (
          <div className="bg-background/60 p-3 rounded-2xl border border-border/40 flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-sans flex items-center gap-1.5">
              <Coins size={13} className="text-gdp" />
              هزینه اعزام تا مرز:
            </span>
            <span
              className={`font-bold text-sm ${canAfford ? "text-gdp" : "text-military"}`}
            >
              {PersianNumberFormatter.formatCurrency(totalLogisticsCost)}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-background/60 p-2.5 rounded-2xl border border-border/40 space-y-1">
                <span className="text-muted-foreground block text-[10px] font-sans flex items-center gap-1">
                  <Coins size={11} className="text-primary" />
                  هزینه اعزام تا ساحل (لجستیک زمینی):
                </span>
                <span className="font-bold text-foreground block text-xs">
                  {PersianNumberFormatter.formatCurrency(baseDeploymentCost)}
                </span>
              </div>

              <div className="bg-background/60 p-2.5 rounded-2xl border border-border/40 space-y-1">
                <span className="text-muted-foreground block text-[10px] font-sans flex items-center gap-1">
                  <Anchor size={11} className="text-gdp" />
                  هزینه ترابری ناوگان دریایی:
                </span>
                <span className="font-bold text-gdp block text-xs">
                  +
                  {PersianNumberFormatter.formatCurrency(
                    navalTransportExtraCost,
                  )}
                </span>
              </div>
            </div>

            <div className="bg-secondary/60 p-2.5 rounded-2xl border border-border/60 flex items-center justify-between text-xs">
              <span className="font-bold text-foreground font-sans flex items-center gap-1.5">
                <Coins size={13} className="text-military" />
                مجموع هزینه عملیات دریایی:
              </span>
              <span
                className={`font-extrabold text-sm ${canAfford ? "text-gdp" : "text-military"}`}
              >
                {PersianNumberFormatter.formatCurrency(totalLogisticsCost)}
              </span>
            </div>
          </div>
        )}
      </div>

      {!canAfford && (
        <div className="p-3 bg-military/15 border border-military/30 rounded-2xl flex items-center gap-2 text-xs text-military">
          <ShieldAlert size={15} className="shrink-0" />
          <span>
            موجودی خزانه برای پوشش کامل مخارج لجستیکی این تهاجم کافی نیست.
          </span>
        </div>
      )}

      <button
        onClick={onExecute}
        disabled={isButtonDisabled}
        className="w-full py-4 bg-military hover:bg-military/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-xl shadow-military/20 flex items-center justify-center gap-2"
      >
        <Zap size={16} />
        <span>
          {isSubmitting
            ? "در حال ثبت دستور و گسیل ارتش..."
            : !isAccessible
              ? "عدم امکان دسترسی به منطقه تهاجم"
              : !hasSelectedInfantry
                ? "حداقل ۱ لشکر پیاده‌نظام جهت تصرف الزامی است"
                : !canAfford
                  ? "موجودی خزانه ناکافی جهت تأمین مخارج"
                  : `صدور فرمان تهاجم به ${formattedRegionName} (${PersianNumberFormatter.formatCurrency(totalLogisticsCost)})`}
        </span>
      </button>
    </div>
  );
}
