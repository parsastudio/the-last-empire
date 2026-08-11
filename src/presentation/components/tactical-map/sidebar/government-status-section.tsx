import React from "react";
import {
  Landmark,
  Globe,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

interface GovernmentStatusSectionProps {
  stability: number;
  reputation: number;
  nation?: Nation | null;
}

export function GovernmentStatusSection({
  stability,
  reputation,
  nation,
}: GovernmentStatusSectionProps) {
  const stabilityDelta = nation
    ? StabilityCalculator.calculateTurnStabilityDelta(nation)
    : 0;

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

  const reputationStyle =
    reputation > 0
      ? {
          border: "border-gdp/30 hover:border-gdp/60",
          topLine: "from-gdp/60 via-emerald-500/40",
          text: "text-gdp",
          badgeBg: "bg-gdp/15 text-gdp border-gdp/30",
        }
      : reputation < 0
        ? {
            border: "border-military/30 hover:border-military/60",
            topLine: "from-military/60 via-rose-500/40",
            text: "text-military",
            badgeBg: "bg-military/15 text-military border-military/30",
          }
        : {
            border: "border-border hover:border-border/80",
            topLine: "from-border via-secondary",
            text: "text-foreground",
            badgeBg: "bg-secondary text-muted-foreground border-border",
          };

  const deltaText =
    stabilityDelta >= 0
      ? `+${PersianNumberFormatter.toPersianDigits(stabilityDelta)}٪ / نوبت`
      : `${PersianNumberFormatter.toPersianDigits(stabilityDelta)}٪ / نوبت`;

  return (
    <div className="space-y-3 dir-rtl text-right font-sans">
      <div className="flex items-center gap-2 px-1">
        <Landmark size={14} className="text-diplomacy" />
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider font-mono">
          وضعیت حکومت، ثبات و اعتبار بین‌المللی
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

        <div
          className={`bg-background/60 border ${reputationStyle.border} p-4 rounded-2xl space-y-3 shadow-lg relative overflow-hidden transition-all group flex flex-col justify-between`}
        >
          <div
            className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${reputationStyle.topLine} to-transparent`}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              {reputation < 0 ? (
                <ShieldAlert size={15} className="text-military shrink-0" />
              ) : (
                <Globe size={15} className="text-gdp shrink-0" />
              )}
              <span>اعتبار و پرستیژ جهانی</span>
            </div>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold border ${reputationStyle.badgeBg}`}
            >
              {reputation > 0
                ? "موقعیت مطلوب"
                : reputation < 0
                  ? "تحت انزوا"
                  : "بی‌طرف"}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-2 text-center space-y-1">
            <span
              className={`text-3xl md:text-4xl font-black font-mono ${reputationStyle.text} tracking-tight drop-shadow-sm`}
            >
              {reputation > 0 ? "+" : ""}
              {PersianNumberFormatter.toPersianDigits(reputation)}
            </span>
            <span className="text-[10px] text-muted-foreground font-sans">
              امتیاز جایگاه دیپلماتیک بین‌المللی
            </span>
          </div>

          <div className="bg-secondary/50 border border-border/50 p-2 rounded-xl flex items-center justify-between text-[10px] font-mono">
            <span className="text-muted-foreground font-sans">
              وضعیت جایگاه عمومی:
            </span>
            <span className={`font-extrabold ${reputationStyle.text}`}>
              {reputation > 20
                ? "قدرت محبوب"
                : reputation < -20
                  ? "تهدید بین‌المللی"
                  : "موقعیت عادی"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
