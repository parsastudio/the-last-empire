import React from "react";
import { Landmark } from "lucide-react";

interface TaxControlCardProps {
  taxRate: number;
}

export function TaxControlCard({ taxRate }: TaxControlCardProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Landmark size={13} className="text-diplomacy" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تنظیمات مالیاتی و قانون
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">نرخ مالیات فعلی</span>
          <span className="font-mono font-bold text-foreground">
            {taxRate}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          defaultValue={taxRate}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <button
          onClick={() => alert("نرخ مالیات بروزرسانی شد.")}
          className="w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border cursor-pointer"
        >
          اعمال نرخ جدید مالیات
        </button>
      </div>
    </div>
  );
}
