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
    <div className="relative p-5 rounded-3xl border border-border/80 bg-gradient-to-r from-secondary/60 via-card to-secondary/40 shadow-lg backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-5 font-sans dir-rtl text-right">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="w-14 h-14 rounded-2xl bg-gdp/15 border border-gdp/30 flex items-center justify-center text-gdp shrink-0 shadow-inner">
          <Factory size={28} className="animate-pulse" />
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-black text-foreground">
              احداث و توسعه زیرساخت کارخانجات ملی
            </h3>
            <span className="text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-lg">
              قیمت پایه: ۱ میلیارد دلار / سوله
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            تخصیص ۱۰٪ بودجه خزانه به احداث فوری سوله با توزیع خودکار در
            متوازن‌ترین استان‌های کشور.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
        <div className="bg-background/80 border border-border/60 px-4 py-2.5 rounded-2xl space-y-1 w-full sm:w-48 text-center font-mono">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans font-bold">
            <span>ظرفیت صنعتی کشور</span>
            <span className={isFull ? "text-emerald-400" : "text-gdp"}>
              {PersianNumberFormatter.toPersianDigits(occupancyPct)}٪
            </span>
          </div>

          <div className="text-xs font-black text-foreground">
            {PersianNumberFormatter.formatNumberWithCommas(
              totalActiveFactories,
            )}{" "}
            <span className="text-[10px] text-muted-foreground font-normal">
              از {PersianNumberFormatter.formatNumberWithCommas(totalMaxSlots)}{" "}
              سوله
            </span>
          </div>

          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? "bg-emerald-400" : "bg-gdp"
              }`}
              style={{ width: `${Math.min(100, occupancyPct)}%` }}
            />
          </div>
        </div>

        <div className="w-full sm:w-auto">
          {isFull ? (
            <div className="py-3 px-5 bg-secondary/80 text-muted-foreground rounded-2xl text-xs font-bold border border-border/70 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>ظرفیت ساخت استان‌ها تکمیل است</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onBuild}
              disabled={!canAfford || isBuilding}
              className="w-full sm:w-auto py-3.5 px-6 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl font-black text-xs transition-all cursor-pointer shadow-xl shadow-gdp/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-gdp/30"
            >
              {isBuilding ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Zap size={16} />
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
    </div>
  );
}
