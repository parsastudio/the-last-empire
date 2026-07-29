import React from "react";
import { TrendingUp, AlertCircle } from "lucide-react";

interface PredictiveImpactBoxProps {
  currentTaxRate: number;
  newTaxRate: number;
  baseGdp: number;
  corruption?: number;
}

export function PredictiveImpactBox({
  currentTaxRate,
  newTaxRate,
  baseGdp,
  corruption = 0,
}: PredictiveImpactBoxProps) {
  const deltaRate = newTaxRate - currentTaxRate;
  const grossTax = baseGdp * (newTaxRate / 100);
  const corruptionLoss = grossTax * (corruption / 100);
  const projectedIncome = Math.floor(grossTax - corruptionLoss);

  let stabilityImpact = 0;
  if (newTaxRate > 25) {
    stabilityImpact = -Math.floor((newTaxRate - 25) * 0.5);
  } else if (newTaxRate <= 10) {
    stabilityImpact = 1;
  }

  return (
    <div className="bg-secondary/40 border border-border/60 p-3 rounded-xl space-y-2 font-mono text-xs dir-rtl text-right">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
        <TrendingUp size={12} className="text-gdp" />
        <span>پیش‌بینی زنده پیامدهای اقتصادی</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-background/60 p-2 rounded-lg space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans">
            درآمد مالیاتی خالص تخمینی:
          </span>
          <span className="font-bold text-gdp">
            ${(projectedIncome / 1e6).toFixed(1)}M
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-lg space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans">
            تغییر ثبات سیاسی:
          </span>
          <span
            className={`font-bold ${
              stabilityImpact < 0
                ? "text-military"
                : stabilityImpact > 0
                  ? "text-gdp"
                  : "text-foreground"
            }`}
          >
            {stabilityImpact > 0
              ? `+${stabilityImpact}%`
              : `${stabilityImpact}%`}
          </span>
        </div>
      </div>

      {Math.abs(deltaRate) > 15 && (
        <div className="flex items-center gap-1.5 text-[10px] text-military bg-military/10 p-2 rounded-lg border border-military/30">
          <AlertCircle size={12} className="shrink-0" />
          <span className="font-sans">
            هشدار: تغییر شوک‌آور بیش از ۱۵٪ نرخ مالیات باعث افت فوری ثبات سیاسی
            خواهد شد!
          </span>
        </div>
      )}
    </div>
  );
}
