import React from "react";
import {
  Zap,
  TrendingUp,
  Cpu,
  Factory,
  Loader2,
  Coins,
  CheckCircle2,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface MachineryTrancheInfo {
  percentage: number;
  percentageLabel: string;
  badgeTitle: string;
  quantity: number;
  totalFactories: number;
  totalCost: number;
  currentTech: number;
  targetTech: number;
  projectedTech: number;
  projectedIncomeDelta: number;
  canAfford: boolean;
  isMaxedOut: boolean;
}

interface MachineryTrancheCardProps {
  tranche: MachineryTrancheInfo;
  isSubmitting: boolean;
  onExecute: (quantity: number) => void;
}

export function MachineryTrancheCard({
  tranche,
  isSubmitting,
  onExecute,
}: MachineryTrancheCardProps) {
  const isHundred = tranche.percentage === 1.0;
  const isTwentyFive = tranche.percentage === 0.25;

  const style = tranche.isMaxedOut
    ? {
        border: "border-border/60",
        bg: "bg-secondary/30 opacity-70",
        badge: "bg-secondary text-muted-foreground border-border/60",
        button: "bg-secondary text-muted-foreground border border-border/40",
      }
    : isHundred
      ? {
          border: "border-gdp/50 hover:border-gdp",
          bg: "bg-gradient-to-b from-gdp/15 via-card/95 to-secondary/60",
          badge: "bg-gdp/20 text-gdp border-gdp/40",
          button:
            "bg-gdp hover:bg-gdp/90 shadow-gdp/20 text-primary-foreground",
        }
      : isTwentyFive
        ? {
            border: "border-primary/50 hover:border-primary",
            bg: "bg-gradient-to-b from-primary/15 via-card/95 to-secondary/60",
            badge: "bg-primary/20 text-primary border-primary/40",
            button:
              "bg-primary hover:bg-primary/90 shadow-primary/20 text-primary-foreground",
          }
        : {
            border: "border-border/80 hover:border-border",
            bg: "bg-card/90",
            badge: "bg-secondary text-muted-foreground border-border/60",
            button:
              "bg-secondary hover:bg-secondary/80 text-foreground border border-border",
          };

  return (
    <div
      className={`p-4.5 rounded-3xl border ${style.border} ${style.bg} space-y-3.5 flex flex-col justify-between transition-all shadow-md backdrop-blur-md`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg border ${style.badge}`}
            >
              {tranche.percentageLabel}
            </span>
            <h4 className="text-xs font-black text-foreground">
              {tranche.badgeTitle}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {PersianNumberFormatter.toPersianDigits(tranche.quantity)} سوله
          </span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          <div className="bg-background/70 border border-border/50 p-2.5 rounded-2xl flex items-center justify-between">
            <span className="text-muted-foreground font-sans text-[11px] flex items-center gap-1.5">
              <Factory size={13} className="text-primary" />
              <span>پوشش خطوط تولید:</span>
            </span>
            <span className="font-bold text-foreground">
              {PersianNumberFormatter.formatNumberWithCommas(tranche.quantity)}{" "}
              <span className="text-[10px] text-muted-foreground font-normal">
                از{" "}
                {PersianNumberFormatter.formatNumberWithCommas(
                  tranche.totalFactories,
                )}
              </span>
            </span>
          </div>

          <div className="bg-background/70 border border-border/50 p-2.5 rounded-2xl flex items-center justify-between">
            <span className="text-muted-foreground font-sans text-[11px] flex items-center gap-1.5">
              <Cpu size={13} className="text-amber-500" />
              <span>میانگین جدید تجهیزات:</span>
            </span>
            <span className="font-black text-gdp text-xs">
              لِوِل{" "}
              {PersianNumberFormatter.toPersianDigits(
                tranche.currentTech.toFixed(1),
              )}{" "}
              ➔{" "}
              {PersianNumberFormatter.toPersianDigits(
                tranche.projectedTech.toFixed(2),
              )}
            </span>
          </div>

          <div className="bg-background/70 border border-border/50 p-2.5 rounded-2xl flex items-center justify-between">
            <span className="text-muted-foreground font-sans text-[11px] flex items-center gap-1.5">
              <TrendingUp size={13} className="text-emerald-400" />
              <span>رشد سود هر نوبت:</span>
            </span>
            <span className="font-black text-emerald-400 text-xs">
              {tranche.isMaxedOut
                ? "سقف سود فعال"
                : `+${PersianNumberFormatter.formatCurrency(tranche.projectedIncomeDelta, true)}`}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-border/40 font-mono">
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-muted-foreground font-sans text-[11px] flex items-center gap-1">
            <Coins size={13} className="text-gdp" />
            <span>مبلغ نوسازی بسته:</span>
          </span>
          <span className="font-black text-sm text-foreground">
            {tranche.isMaxedOut
              ? "صفر"
              : PersianNumberFormatter.formatCurrency(tranche.totalCost)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onExecute(tranche.quantity)}
          disabled={tranche.isMaxedOut || !tranche.canAfford || isSubmitting}
          className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none ${style.button}`}
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : tranche.isMaxedOut ? (
            <CheckCircle2 size={14} />
          ) : (
            <Zap size={14} />
          )}
          <span>
            {tranche.isMaxedOut
              ? "تجهیزات در بالاترین سطح ممکن است"
              : !tranche.canAfford
                ? "موجودی خزانه ناکافی است"
                : `نوسازی بسته (${PersianNumberFormatter.formatCurrency(tranche.totalCost, true)})`}
          </span>
        </button>
      </div>
    </div>
  );
}
