import React from "react";
import { Swords, PlusCircle, ShieldAlert } from "lucide-react";

export function MilitaryActionsCard() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Swords size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          صف ارتقا و استخدام ارتش
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            استخدام پیاده‌نظام (۱۰ هزار)
          </span>
          <span className="font-mono font-bold text-foreground">$100,000</span>
        </div>
        <button
          onClick={() => alert("سفارش استخدام ثبت شد.")}
          className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle size={14} className="text-gdp" />
          <span>ثبت سفارش استخدام</span>
        </button>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">ارتقای سطح فناوری نظامی</span>
          <span className="font-mono font-bold text-gdp">$100,000</span>
        </div>
        <button
          onClick={() => alert("پژوهش نظامی آغاز شد.")}
          className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldAlert size={14} className="text-amber-500" />
          <span>تحقیق فناوری لِوِل بعد</span>
        </button>
      </div>
    </div>
  );
}
