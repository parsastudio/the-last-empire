import React from "react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface MilitaryReadinessCardProps {
  techLevel: number;
  experience: number;
}

export function MilitaryReadinessCard({
  techLevel,
  experience,
}: MilitaryReadinessCardProps) {
  const bonusPercent = Math.round((techLevel - 1) * 50);

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="bg-background/50 border border-border/70 p-3 rounded-2xl flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-sans font-bold">
          سطح فناوری ارتش
        </span>
        <span className="text-xs font-bold text-amber-500 font-mono">
          سطح {PersianNumberFormatter.toPersianDigits(techLevel.toFixed(1))}{" "}
          {bonusPercent > 0 && (
            <span className="text-[10px] text-gdp font-mono">
              (+{PersianNumberFormatter.toPersianDigits(bonusPercent)}٪)
            </span>
          )}
        </span>
      </div>
      <div className="bg-background/50 border border-border/70 p-3 rounded-2xl flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-sans font-bold">
          آمادگی عملیاتی
        </span>
        <span className="text-xs font-bold text-amber-500 font-mono">
          {PersianNumberFormatter.toPersianDigits(experience)}%
        </span>
      </div>
    </div>
  );
}
