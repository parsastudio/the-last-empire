import React from "react";
import { Sparkles } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export interface CapturedUnitItem {
  label: string;
  count: number;
  icon: string;
}

interface CapturedUnitsGridProps {
  units: CapturedUnitItem[];
}

export function CapturedUnitsGrid({ units }: CapturedUnitsGridProps) {
  if (units.length === 0) return null;

  return (
    <div className="bg-card/95 border border-border/80 rounded-2xl overflow-hidden shadow-md w-full">
      <div className="p-3 border-b border-border/60 bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-400" />
          <h4 className="text-xs font-black text-foreground">
            غنائم تسلیحاتی اسیرشده
          </h4>
        </div>
        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
          ادغام فوری ⚡
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 w-full">
        {units.map((item, idx) => (
          <div
            key={idx}
            className="bg-secondary/40 border border-border/60 p-2.5 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
              <span className="text-base select-none">{item.icon}</span>
              <span className="font-sans truncate">{item.label}</span>
            </div>
            <span className="text-xs font-black font-mono text-emerald-400">
              +
              {PersianNumberFormatter.toPersianDigits(
                item.count.toLocaleString("en-US"),
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
