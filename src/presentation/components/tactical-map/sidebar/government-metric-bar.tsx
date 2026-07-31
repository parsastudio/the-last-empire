import React from "react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface GovernmentMetricBarProps {
  label: string;
  value: number;
  deltaText?: string;
  colorClass: string;
  bgClass: string;
}

export function GovernmentMetricBar({
  label,
  value,
  deltaText,
  colorClass,
  bgClass,
}: GovernmentMetricBarProps) {
  return (
    <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1.5 dir-rtl text-right">
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-muted-foreground font-sans">{label}</span>
        <div className="flex items-center gap-1.5 font-mono">
          {deltaText && (
            <span className="text-[9px] text-muted-foreground font-sans bg-secondary/80 px-1.5 py-0.5 rounded">
              {deltaText}
            </span>
          )}
          <span className={`font-bold ${colorClass}`}>
            {PersianNumberFormatter.toPersianDigits(value)}٪
          </span>
        </div>
      </div>
      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
        <div
          className={`${bgClass} h-full rounded-full transition-all`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
