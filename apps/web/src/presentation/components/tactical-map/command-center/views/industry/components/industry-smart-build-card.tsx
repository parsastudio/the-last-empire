import React from "react";
import { Factory, Zap, Loader2, CheckCircle2 } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface IndustrySmartBuildCardProps {
  totalActiveFactories: number;
  totalMaxSlots: number;
  totalEmptySlots: number;
  batchQuantity: number;
  batchCost: number;
  canAfford: boolean;
  isBuilding: boolean;
  onBuild: () => void;
}

export function IndustrySmartBuildCard({
  totalActiveFactories,
  totalMaxSlots,
  totalEmptySlots,
  batchQuantity,
  batchCost,
  canAfford,
  isBuilding,
  onBuild,
}: IndustrySmartBuildCardProps) {
  const isFull = totalEmptySlots <= 0;
  const occupancyPct =
    totalMaxSlots > 0
      ? Math.round((totalActiveFactories / totalMaxSlots) * 100)
      : 100;

  return (
    <div className="space-y-2.5 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Factory size={14} className="text-gdp" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            احداث زیرساخت کارخانجات ملی
          </span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 border ${
            isFull
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-gdp/10 text-gdp border-gdp/30"
          }`}
        >
          {isFull ? "ظرفیت ۱۰۰٪" : "۱ میلیارد / سوله"}
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs pb-2.5 border-b border-border/50 font-mono">
          <span className="text-muted-foreground font-sans font-bold text-[11px]">
            ظرفیت اشغال صنعتی کشور:
          </span>
          <span className="font-extrabold text-xs text-foreground">
            {PersianNumberFormatter.formatNumberWithCommas(
              totalActiveFactories,
            )}{" "}
            <span className="text-[10px] text-muted-foreground font-normal">
              از {PersianNumberFormatter.formatNumberWithCommas(totalMaxSlots)}{" "}
              سوله
            </span>
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-muted-foreground font-sans">
            <span>تکمیل کل اسلات‌های دائم:</span>
            <span
              className={`font-bold font-mono ${
                isFull ? "text-emerald-400" : "text-gdp"
              }`}
            >
              {PersianNumberFormatter.toPersianDigits(occupancyPct)}٪
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden border border-border/40">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? "bg-emerald-400" : "bg-gdp"
              }`}
              style={{ width: `${Math.min(100, occupancyPct)}%` }}
            />
          </div>
        </div>

        <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-xl text-[10px] text-muted-foreground font-sans leading-relaxed">
          تخصیص ۱۰٪ بودجه خزانه به احداث فوری سوله با توزیع خودکار در
          متوازن‌ترین استان‌های کشور.
        </div>

        {isFull ? (
          <div className="w-full py-3 bg-secondary/80 text-muted-foreground rounded-xl text-xs font-bold border border-border/60 flex items-center justify-center gap-1.5 select-none">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>ظرفیت ساخت تمامی استان‌ها تکمیل است</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onBuild}
            disabled={!canAfford || isBuilding}
            className="w-full py-3 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isBuilding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Zap size={14} />
            )}
            <span>
              {!canAfford
                ? "موجودی خزانه ناکافی است"
                : `احداث فوری ${PersianNumberFormatter.formatNumberWithCommas(batchQuantity)} سوله (${PersianNumberFormatter.formatCurrency(batchCost, true)})`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
