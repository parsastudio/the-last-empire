import React from "react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { MilitaryPowerCalculator } from "@geopolitics/domain";

interface MilitaryReadinessCardProps {
  techLevel: number;
}

export function MilitaryReadinessCard({
  techLevel,
}: MilitaryReadinessCardProps) {
  const techMult = MilitaryPowerCalculator.calculateTechMultiplier(techLevel);
  const bonusPercent = Math.round((techMult - 1) * 100);

  return (
    <div className="bg-background/50 border border-border/70 p-3 rounded-2xl flex items-center justify-between">
      <span className="text-[10px] text-muted-foreground font-sans font-bold">
        سطح فناوری دفاعی
      </span>
      <span className="text-xs font-bold text-amber-500 font-mono">
        سطح {PersianNumberFormatter.toPersianDigits(techLevel.toFixed(1))}{" "}
        {bonusPercent > 0 && (
          <span className="text-[10px] text-gdp font-mono">
            (+{PersianNumberFormatter.toPersianDigits(bonusPercent)}٪ کارایی)
          </span>
        )}
      </span>
    </div>
  );
}
