import React from "react";
import { TrendingUp, ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface PredictiveImpactBoxProps {
  currentTaxRate: number;
  newTaxRate: number;
  baseGdp: number;
  corruption?: number;
}

export function PredictiveImpactBox({
  newTaxRate,
  baseGdp,
  corruption = 0,
}: PredictiveImpactBoxProps) {
  const turnTaxFactor = 0.025;
  const grossTax = baseGdp * turnTaxFactor * (newTaxRate / 100);
  const corruptionLoss = grossTax * (corruption / 100);
  const projectedIncome = Math.floor(grossTax - corruptionLoss);

  const stabilityImpact = Number((2.0 - (newTaxRate / 100) * 14.0).toFixed(2));

  return (
    <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs dir-rtl text-right">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
        <TrendingUp size={13} className="text-gdp" />
        <span>پایش زنده اثرات مالیاتی</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-background/60 p-2 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            درآمد مالیاتی نوبتی:
          </span>
          <span className="font-bold text-gdp text-[11px]">
            {PersianNumberFormatter.formatCurrency(projectedIncome)}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            نوسان ثبات نوبتی:
          </span>
          <span
            className={`font-bold text-[11px] ${
              stabilityImpact > 0
                ? "text-gdp"
                : stabilityImpact < 0
                  ? "text-military"
                  : "text-foreground"
            }`}
          >
            {stabilityImpact > 0 ? "+" : ""}
            {PersianNumberFormatter.toPersianDigits(stabilityImpact)}٪
          </span>
        </div>
      </div>

      {newTaxRate > 35 && (
        <div className="flex items-center gap-1.5 text-[10px] text-military bg-military/10 p-2 rounded-xl border border-military/30 font-sans">
          <ShieldAlert size={13} className="shrink-0" />
          <span>
            مالیات بالای ۳۵٪ به دلیل کاهش شدید و مداوم ثبات نوبتی، کشور را در
            مسیر بحران سیاسی قرار می‌دهد!
          </span>
        </div>
      )}
    </div>
  );
}
