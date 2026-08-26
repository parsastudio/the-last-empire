import React from "react";
import { ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface TaxPredictiveImpactBoxProps {
  newTaxRate: number;
  baseGdp: number;
}

export function TaxPredictiveImpactBox({
  newTaxRate,
  baseGdp,
}: TaxPredictiveImpactBoxProps) {
  const clampedRate = Math.min(50, Math.max(0, newTaxRate));
  const projectedIncome = Math.floor(baseGdp * (clampedRate / 100));
  const stabilityImpact = Number(((15 - clampedRate) * 0.1).toFixed(2));

  return (
    <div className="space-y-2 font-mono text-xs dir-rtl text-right">
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            درآمد مالیاتی نوبتی:
          </span>
          <span className="font-bold text-gdp text-xs block truncate">
            {PersianNumberFormatter.formatCurrency(projectedIncome)}
          </span>
        </div>

        <div className="bg-secondary/40 p-2.5 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            نوسان ثبات نوبتی:
          </span>
          <span
            className={`font-bold text-xs block ${
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

      {newTaxRate > 30 && (
        <div className="flex items-center gap-1.5 text-[10px] text-military bg-military/10 p-2 rounded-xl border border-military/30 font-sans">
          <ShieldAlert size={13} className="shrink-0" />
          <span>
            مالیات بالای ۳۰٪ با افت شدید ثبات، کشور را در معرض بحران سیاسی قرار
            می‌دهد.
          </span>
        </div>
      )}
    </div>
  );
}
