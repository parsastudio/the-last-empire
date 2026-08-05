import React, { useState } from "react";
import { ShieldCheck, Zap, Loader2 } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { PercentageSelector } from "@/presentation/components/common/percentage-selector";

interface AntiCorruptionCardProps {
  nationId: string;
  treasury?: number;
  gdp?: number;
  currentCorruption?: number;
}

export function AntiCorruptionCard({
  nationId,
  treasury = 100000,
  gdp = 450000000000,
  currentCorruption = 0,
}: AntiCorruptionCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حفظ دقیق عدد اعشاری (مثلاً ۷.۰۲)
  const actualCorruption = Number((currentCorruption || 0).toFixed(2));
  const maxReducible = Math.min(100, Math.max(0, actualCorruption));

  const [userTargetReduction, setUserTargetReduction] = useState<number | null>(
    null,
  );

  const targetReduction = Math.min(
    maxReducible,
    userTargetReduction ?? Math.min(5, maxReducible),
  );

  const antiCorruptionCost = Math.ceil(gdp * (targetReduction / 100));
  const canAfford = treasury >= antiCorruptionCost;
  const { dispatchAction } = useGameActions();

  const handleAntiCorruption = async () => {
    if (
      !canAfford ||
      targetReduction <= 0 ||
      actualCorruption <= 0.01 ||
      isSubmitting
    )
      return;

    try {
      setIsSubmitting(true);
      const action = ActionFactory.antiCorruptionDrive(
        nationId,
        antiCorruptionCost,
      );
      await dispatchAction(
        action,
        `مبلغ ${PersianNumberFormatter.formatCurrency(antiCorruptionCost)} به آژانس بازرسی ملی تزریق شد و شاخص فساد اداری ${PersianNumberFormatter.toPersianDigits(Number(targetReduction.toFixed(2)))}٪ کاهش یافت.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePercentageSelect = (percentage: number) => {
    if (maxReducible <= 0) return;
    if (percentage === 1) {
      setUserTargetReduction(maxReducible);
    } else {
      const target = Number((maxReducible * percentage).toFixed(2));
      setUserTargetReduction(Math.max(0.01, target));
    }
  };

  const resultingCorruption = Math.max(0, actualCorruption - targetReduction);
  const displayResultingCorruption =
    resultingCorruption <= 0.01 ? 0 : Number(resultingCorruption.toFixed(2));

  // محاسبه درصد دقیق برای پر کردن نوار اسلایدر
  const sliderPercentage =
    maxReducible > 0 ? (targetReduction / maxReducible) * 100 : 0;

  const formatNum = (num: number) =>
    PersianNumberFormatter.toPersianDigits(
      Number.isInteger(num) ? num.toString() : num.toFixed(2),
    );

  return (
    <div className="space-y-2.5 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          پروژه‌های مبارزه با فساد اداری
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            شاخص فعلی فساد:
          </span>
          <span className="font-bold text-military text-sm">
            {formatNum(actualCorruption)}٪
          </span>
        </div>

        {actualCorruption <= 0.01 ? (
          <div className="p-3 bg-gdp/10 border border-gdp/30 rounded-xl text-center text-xs font-bold text-gdp">
            فساد اداری در کشور به طور کامل ریشه‌کن شده است.
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-sans">
                  میزان کاهش درخواستی:
                </span>
                <span className="font-mono font-extrabold text-gdp text-xs">
                  -{formatNum(targetReduction)}٪ (نهایی:{" "}
                  {formatNum(displayResultingCorruption)}٪)
                </span>
              </div>

              <div className="relative w-full flex items-center h-6">
                <input
                  type="range"
                  min="0.01"
                  max={maxReducible}
                  step="0.01"
                  value={targetReduction}
                  onChange={(e) =>
                    setUserTargetReduction(parseFloat(e.target.value))
                  }
                  style={{
                    background: `linear-gradient(to left, var(--color-gdp) 0%, var(--color-gdp) ${sliderPercentage}%, var(--color-secondary) ${sliderPercentage}%, var(--color-secondary) 100%)`,
                  }}
                  className="w-full cursor-pointer h-2 rounded-lg appearance-none relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gdp [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-gdp [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-card [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>

              <PercentageSelector
                options={[
                  { pct: 0.25, label: "۲۵٪" },
                  { pct: 0.5, label: "۵۰٪" },
                  { pct: 0.75, label: "۷۵٪" },
                  { pct: 1.0, label: "۱۰۰٪ (پاکسازی)", isMax: true },
                ]}
                onSelect={handlePercentageSelect}
                colorVariant="gdp"
              />
            </div>

            <div className="bg-secondary/40 border border-border/40 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground font-sans">
                هزینه محاسباتی طرح:
              </span>
              <span className="font-bold text-gdp">
                {PersianNumberFormatter.formatCurrency(antiCorruptionCost)}
              </span>
            </div>

            <button
              onClick={handleAntiCorruption}
              disabled={!canAfford || targetReduction <= 0 || isSubmitting}
              className="w-full py-2.5 bg-gdp hover:bg-gdp/90 disabled:opacity-40 text-primary-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Zap size={14} />
              )}
              <span>
                {isSubmitting
                  ? "در حال اجرای طرح ضدفساد..."
                  : canAfford
                    ? `تزریق بودجه ضدفساد (-${formatNum(targetReduction)}٪ فساد)`
                    : "خزانه ناکافی جهت اجرای طرح ضدفساد"}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
