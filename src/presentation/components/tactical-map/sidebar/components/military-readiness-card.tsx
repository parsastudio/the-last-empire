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
  const bonusPercent = (techLevel - 1) * 20;

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="bg-background/50 border border-border/70 p-3 rounded-2xl flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-sans font-bold">
          فناوری ساخت داخلی
        </span>
        <span className="text-xs font-bold text-amber-500">
          سطح {PersianNumberFormatter.toPersianDigits(techLevel)}{" "}
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
        <span className="text-xs font-bold text-amber-500">
          {PersianNumberFormatter.toPersianDigits(experience)}%
        </span>
      </div>
    </div>
  );
}
