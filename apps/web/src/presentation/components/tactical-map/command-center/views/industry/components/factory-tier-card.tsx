import React from "react";
import { Factory, TrendingUp, Cpu, Gauge } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { FactoryBatch, IndustryCalculator } from "@geopolitics/domain";

interface FactoryTierCardProps {
  batch: FactoryBatch;
  totalFactories: number;
  maxDomesticTech: number;
  rankIndex: number;
}

export function FactoryTierCard({
  batch,
  totalFactories,
  maxDomesticTech,
  rankIndex,
}: FactoryTierCardProps) {
  const percentage =
    totalFactories > 0 ? Math.round((batch.count / totalFactories) * 100) : 100;

  const singleYield = IndustryCalculator.calculateFactoryYield(batch.techLevel);
  const totalTierYield = batch.count * singleYield;
  const isPeakTech = batch.techLevel >= maxDomesticTech;

  const cardStyle = isPeakTech
    ? "border-gdp/50 bg-gradient-to-b from-gdp/15 via-card/90 to-card hover:border-gdp shadow-gdp/10"
    : rankIndex === 0
      ? "border-primary/40 bg-gradient-to-b from-primary/10 via-card/90 to-card hover:border-primary shadow-primary/10"
      : "border-border/80 bg-card/80 hover:border-border";

  const badgeStyle = isPeakTech
    ? "bg-gdp/20 text-gdp border-gdp/40"
    : "bg-primary/20 text-primary border-primary/40";

  return (
    <div
      className={`min-w-[210px] flex-1 p-4 rounded-3xl border ${cardStyle} shadow-lg transition-all flex flex-col justify-between space-y-3 font-sans dir-rtl text-right hover:scale-[1.02] backdrop-blur-md`}
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center text-foreground border border-border/60">
              <Factory
                size={16}
                className={isPeakTech ? "text-gdp" : "text-primary"}
              />
            </div>
            <div>
              <span className="text-xs font-black text-foreground block">
                رده صنعتی #
                {PersianNumberFormatter.toPersianDigits(rankIndex + 1)}
              </span>
              <span className="text-[9px] text-muted-foreground font-mono">
                {isPeakTech ? "تجهیزات مدرن بومی" : "خطوط نیازمند ارتقا"}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${badgeStyle}`}
          >
            لِوِل{" "}
            {PersianNumberFormatter.toPersianDigits(batch.techLevel.toFixed(1))}
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="bg-background/60 p-2.5 rounded-2xl border border-border/40 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans">
              <span className="flex items-center gap-1">
                <Gauge size={11} className="text-primary" />
                <span>تعداد کارخانجات:</span>
              </span>
              <span className="font-bold text-gdp font-mono">
                {PersianNumberFormatter.toPersianDigits(percentage)}٪ از کل
              </span>
            </div>
            <span className="text-sm font-black text-foreground block">
              {PersianNumberFormatter.formatNumberWithCommas(batch.count)}{" "}
              <span className="text-[10px] text-muted-foreground font-normal">
                سوله فعال
              </span>
            </span>
          </div>

          <div className="bg-background/60 p-2.5 rounded-2xl border border-border/40 space-y-1">
            <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
              <TrendingUp size={11} className="text-emerald-400" />
              <span>بازدهی مجموع رده:</span>
            </span>
            <span className="text-xs font-black text-emerald-400 block truncate">
              +{PersianNumberFormatter.formatCurrency(totalTierYield, true)} /
              نوبت
            </span>
            <span className="text-[8px] text-muted-foreground block font-sans">
              (هر سوله:{" "}
              {PersianNumberFormatter.formatCurrency(singleYield, true)})
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border/40 space-y-1 font-mono text-[9px] text-muted-foreground">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 font-sans">
            <Cpu size={10} className="text-amber-400" />
            <span>کیفیت خط تولید:</span>
          </span>
          <span className="font-bold text-foreground">
            {PersianNumberFormatter.toPersianDigits(
              Math.min(100, Math.round((batch.techLevel / 6) * 100)),
            )}
            ٪ استاندارد
          </span>
        </div>
        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isPeakTech ? "bg-gdp" : "bg-primary"
            }`}
            style={{
              width: `${Math.min(100, (batch.techLevel / Math.max(1, maxDomesticTech)) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
