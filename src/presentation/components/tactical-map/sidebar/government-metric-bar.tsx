import React from "react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface GovernmentMetricBarProps {
  label: string;
  value: number;
  colorClass: string;
  bgClass: string;
}

export function GovernmentMetricBar({
  label,
  value,
  colorClass,
  bgClass,
}: GovernmentMetricBarProps) {
  return (
    <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1.5 dir-rtl text-right">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground font-sans">{label}</span>
        <span className={`font-bold ${colorClass}`}>
          {PersianNumberFormatter.toPersianDigits(value)}٪
        </span>
      </div>
      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
        <div
          className={`${bgClass} h-full rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
