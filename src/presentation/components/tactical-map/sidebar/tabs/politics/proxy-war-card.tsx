import React, { useState } from "react";
import { Zap } from "lucide-react";

export function ProxyWarCard() {
  const [budget, setBudget] = useState<number>(15000);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Zap size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          بودجه نفوذ و جنگ نیابتی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">بودجه تخصیصی:</span>
          <span className="font-mono font-bold text-foreground">
            ${budget.toLocaleString("fa-IR")}
          </span>
        </div>

        <input
          type="range"
          min="5000"
          max="50000"
          step="5000"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-rose-600 cursor-pointer h-2 bg-secondary rounded-lg"
        />

        <button
          onClick={() =>
            alert(
              `مبلغ $${budget.toLocaleString("fa-IR")} جهت عملیات نفوذ و تضعیف ثبات سیاسی کشور رقیب اختصاص یافت.`,
            )
          }
          className="w-full py-2.5 bg-military/15 hover:bg-military/20 text-military border border-military/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          تزریق بودجه عملیات پنهان
        </button>
      </div>
    </div>
  );
}
