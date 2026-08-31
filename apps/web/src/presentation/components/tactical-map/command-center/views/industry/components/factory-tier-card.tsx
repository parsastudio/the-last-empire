import React from "react";
import {
  Factory,
  TrendingUp,
  Coins,
  Plus,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { IndustryCalculator } from "@geopolitics/domain";
import { FactoryTierUpgradeItem } from "../hooks/use-factory-tier-procurement";

interface FactoryTierCardProps {
  item: FactoryTierUpgradeItem;
  totalFactories: number;
  feedbacks?: { id: string; text: string }[];
  isSubmitting?: boolean;
  onUpgrade: (item: FactoryTierUpgradeItem) => void;
}

export function FactoryTierCard({
  item,
  totalFactories,
  feedbacks = [],
  isSubmitting = false,
  onUpgrade,
}: FactoryTierCardProps) {
  const {
    batch,
    rankIndex,
    isMaxedOut,
    targetTech,
    batchQuantity,
    batchCost,
    canAfford,
  } = item;

  const percentage =
    totalFactories > 0 ? Math.round((batch.count / totalFactories) * 100) : 100;

  const singleYield = IndustryCalculator.calculateFactoryYield(batch.techLevel);
  const totalTierYield = batch.count * singleYield;

  return (
    <div
      className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 font-sans dir-rtl text-right shadow-2xl backdrop-blur-2xl overflow-hidden group hover:scale-[1.01] ring-1 ring-white/5 ${
        isMaxedOut
          ? "bg-gradient-to-b from-card via-secondary/70 to-card/95 border-border/80 hover:border-gdp/40 shadow-black/50"
          : "bg-gradient-to-b from-card via-secondary/80 to-card border-border/90 hover:border-gdp/50 shadow-gdp/10"
      }`}
    >
      <div
        className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${
          isMaxedOut
            ? "from-transparent via-gdp/60 to-transparent"
            : "from-transparent via-primary/60 to-transparent"
        }`}
      />

      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md shrink-0 ${
                isMaxedOut
                  ? "bg-gdp/15 text-gdp border-gdp/30 shadow-gdp/10 ring-1 ring-gdp/20"
                  : "bg-primary/15 text-primary border-primary/30 shadow-primary/10 ring-1 ring-primary/20"
              }`}
            >
              <Factory size={18} className="animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-foreground">
                خطوط تولید رده #
                {PersianNumberFormatter.toPersianDigits(rankIndex + 1)}
              </h4>
              <span className="text-[10px] font-mono text-muted-foreground block">
                {isMaxedOut
                  ? "تجهیزات در بالاترین سقف راندمان"
                  : `هدف ارتقا: لِوِل ${PersianNumberFormatter.toPersianDigits(targetTech.toFixed(1))}`}
              </span>
            </div>
          </div>

          <div
            className={`px-2.5 py-1 rounded-xl border font-mono font-bold text-[11px] flex items-center gap-1 shrink-0 ${
              isMaxedOut
                ? "bg-gdp/15 text-gdp border-gdp/40"
                : "bg-primary/15 text-primary border-primary/40"
            }`}
          >
            <Sparkles size={11} />
            <span>
              سطح{" "}
              {PersianNumberFormatter.toPersianDigits(
                batch.techLevel.toFixed(1),
              )}
            </span>
          </div>
        </div>

        <div className="bg-background/70 border border-border/70 p-3.5 rounded-2xl space-y-2 shadow-inner font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-sans">
            <span className="flex items-center gap-1.5 font-bold">
              <Building2 size={13} className="text-primary" />
              <span>کارخانجات فعال رده:</span>
            </span>
            <span className="font-mono font-bold text-gdp bg-gdp/10 border border-gdp/25 px-2 py-0.5 rounded-md text-[10px]">
              {PersianNumberFormatter.toPersianDigits(percentage)}٪ از کل صنایع
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <div className="text-xl font-black font-mono text-foreground tracking-tight">
              {PersianNumberFormatter.formatNumberWithCommas(batch.count)}{" "}
              <span className="text-[11px] text-muted-foreground font-normal font-sans">
                سوله فعال
              </span>
            </div>
          </div>

          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden border border-border/40">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isMaxedOut
                  ? "bg-gdp shadow-sm shadow-gdp/50"
                  : "bg-primary shadow-sm shadow-primary/50"
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40 font-mono text-xs">
            <span className="text-muted-foreground font-sans text-[11px] flex items-center gap-1">
              <TrendingUp size={12} className="text-emerald-400" />
              <span>درآمد نوبتی این رده:</span>
            </span>
            <span className="font-black text-emerald-400 text-xs">
              +{PersianNumberFormatter.formatCurrency(totalTierYield, true)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative pt-1">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-20">
          {feedbacks.map((f) => (
            <span
              key={f.id}
              className="text-xs font-black font-mono text-gdp drop-shadow-xl animate-out fade-out slide-out-to-top-3 duration-700 whitespace-nowrap bg-background/95 px-3 py-0.5 rounded-xl border border-gdp/50 shadow-lg"
            >
              {f.text}
            </span>
          ))}
        </div>

        {isMaxedOut ? (
          <div className="w-full py-3 bg-emerald-950/30 text-emerald-300 rounded-2xl text-xs font-bold border border-emerald-500/40 flex items-center justify-center gap-2 select-none shadow-inner">
            <CheckCircle2 size={15} className="text-gdp" />
            <span>
              مجهز به بالاترین سطح فناوری (سطح{" "}
              {PersianNumberFormatter.toPersianDigits(
                batch.techLevel.toFixed(1),
              )}
              )
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onUpgrade(item)}
            disabled={!canAfford || isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground text-black rounded-2xl text-xs font-black font-mono transition-all cursor-pointer shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-between border border-emerald-300/40"
            title={`ارتقای ${batchQuantity} سوله به سطح ${targetTech.toFixed(1)}`}
          >
            <div className="flex items-center gap-1.5 font-sans">
              <div className="w-5 h-5 rounded-md bg-black/20 flex items-center justify-center">
                <Plus size={12} strokeWidth={3} />
              </div>
              <span className="text-xs font-black">
                ارتقای بومی (
                {PersianNumberFormatter.formatNumberWithCommas(batchQuantity)}{" "}
                سوله)
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-xl border border-black/10">
              <Coins size={12} className="text-amber-950 shrink-0" />
              <span className="text-xs font-extrabold">
                {PersianNumberFormatter.formatCurrency(batchCost, true)}
              </span>
              <ArrowLeft size={11} className="opacity-80" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
