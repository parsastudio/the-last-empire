import React from "react";
import { Hammer, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface IndustryModernizeCardProps {
  totalActiveFactories: number;
  modernizeCost: number;
  canModernize: boolean;
  canAffordModernize: boolean;
  isModernizing: boolean;
  onModernizeAll: () => void;
}

export function IndustryModernizeCard({
  totalActiveFactories,
  modernizeCost,
  canModernize,
  canAffordModernize,
  isModernizing,
  onModernizeAll,
}: IndustryModernizeCardProps) {
  return (
    <div className="bg-card/90 border border-border/80 p-5 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-primary/15 text-primary border border-primary/30">
              <Hammer size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-foreground">
                نوسازی سراسری خطوط تولید
              </h4>
              <span className="text-[10px] text-muted-foreground font-mono">
                تجهیز تمام کارخانه‌ها تا سقف آخرین لول دانش بومی
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2.5 py-0.5 rounded-lg">
            {canModernize ? "نیازمند به‌روزرسانی" : "کاملاً مدرن"}
          </span>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-sans">
              کارخانجات هدف نوسازی:
            </span>
            <span className="font-bold text-foreground">
              {PersianNumberFormatter.formatNumberWithCommas(
                totalActiveFactories,
              )}{" "}
              واحد
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-border/40">
            <span className="text-muted-foreground font-sans">
              مجموع هزینه نوسازی:
            </span>
            <span className="font-extrabold text-foreground">
              {canModernize
                ? PersianNumberFormatter.formatCurrency(modernizeCost, true)
                : "صفر (مجهز به بالاترین فناوری)"}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onModernizeAll}
        disabled={!canModernize || !canAffordModernize || isModernizing}
        className="w-full py-3.5 bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:text-muted-foreground text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
      >
        {isModernizing ? (
          <Loader2 size={14} className="animate-spin" />
        ) : canModernize ? (
          <Sparkles size={14} />
        ) : (
          <CheckCircle2 size={14} />
        )}
        <span>
          {isModernizing
            ? "در حال نوسازی سراسری خطوط تولید..."
            : !canModernize
              ? "تمام کارخانجات مجهز به حداکثر توان علمی هستند"
              : !canAffordModernize
                ? "موجودی خزانه جهت نوسازی کافی نیست"
                : `نوسازی کلیه خطوط تولید (${PersianNumberFormatter.formatCurrency(modernizeCost, true)})`}
        </span>
      </button>
    </div>
  );
}
