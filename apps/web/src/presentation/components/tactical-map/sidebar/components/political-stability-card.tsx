import React from "react";
import { Landmark, TrendingUp, TrendingDown } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface PoliticalStabilityCardProps {
  stability: number;
  stabilityDelta: number;
}

export function PoliticalStabilityCard({
  stability,
  stabilityDelta,
}: PoliticalStabilityCardProps) {
  const stabilityStyle =
    stability >= 70
      ? {
          border: "border-gdp/30 hover:border-gdp/60",
          topLine: "from-gdp/60 via-emerald-500/40",
          text: "text-gdp",
          badgeBg: "bg-gdp/15 text-gdp border-gdp/30",
          statusText: "وضعیت مطلوب و پایدار",
        }
      : stability >= 40
        ? {
            border: "border-treasury/30 hover:border-treasury/60",
            topLine: "from-treasury/60 via-amber-500/40",
            text: "text-treasury",
            badgeBg: "bg-treasury/15 text-treasury border-treasury/30",
            statusText: "هشدار نوسان ثبات",
          }
        : {
            border: "border-military/30 hover:border-military/60",
            topLine: "from-military/60 via-rose-500/40",
            text: "text-military",
            badgeBg: "bg-military/15 text-military border-military/30",
            statusText: "بحران شدید سیاسی",
          };

  const deltaText =
    stabilityDelta >= 0
      ? `+${PersianNumberFormatter.toPersianDigits(stabilityDelta)}٪ / نوبت`
      : `${PersianNumberFormatter.toPersianDigits(stabilityDelta)}٪ / نوبت`;

  return (
    <div
      className={`bg-background/60 border ${stabilityStyle.border} p-4 rounded-2xl space-y-3 shadow-lg relative overflow-hidden transition-all group flex flex-col justify-between`}
    >
      <div
        className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${stabilityStyle.topLine} to-transparent`}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Landmark size={15} className="text-diplomacy shrink-0" />
          <span>ثبات سیاسی داخلی</span>
        </div>
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold border ${stabilityStyle.badgeBg}`}
        >
          {stabilityStyle.statusText}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-2 text-center space-y-1">
        <span
          className={`text-3xl md:text-4xl font-black font-mono ${stabilityStyle.text} tracking-tight drop-shadow-sm`}
        >
          {PersianNumberFormatter.toPersianDigits(stability)}٪
        </span>
        <span className="text-[10px] text-muted-foreground font-sans">
          شاخص پایداری نظام سیاسی حاکم
        </span>
      </div>

      <div className="bg-secondary/50 border border-border/50 p-2 rounded-xl flex items-center justify-between text-[10px] font-mono">
        <span className="text-muted-foreground font-sans flex items-center gap-1">
          {stabilityDelta >= 0 ? (
            <TrendingUp size={11} className="text-gdp" />
          ) : (
            <TrendingDown size={11} className="text-military" />
          )}
          نوسان نوبتی ثبات:
        </span>
        <span
          className={`font-extrabold ${
            stabilityDelta >= 0 ? "text-gdp" : "text-military"
          }`}
        >
          {deltaText}
        </span>
      </div>
    </div>
  );
}
