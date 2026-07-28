import React, { useState } from "react";
import { Zap, ShieldAlert } from "lucide-react";
import { useToast } from "@/presentation/context/toast-context";

export function ProxyWarCard() {
  const [budget, setBudget] = useState<number>(15000);
  const { showToast } = useToast();

  const estimatedStabilityDrain = Math.min(
    15,
    Math.max(1, Math.floor(Math.log10(budget) * 3)),
  );

  const handleApplyProxy = () => {
    showToast(
      "عملیات پنهان نفوذ",
      `مبلغ $${budget.toLocaleString("fa-IR")} جهت تضعیف ثبات سیاسی کشور رقیب اختصاص یافت.`,
      "warning",
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Zap size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          بودجه نفوذ و جنگ نیابتی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right dir-rtl">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">بودجه اختصاصی عملیات:</span>
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

        <div className="bg-secondary/40 border border-border/40 p-2.5 rounded-xl flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-foreground flex items-center gap-1 font-sans">
            <ShieldAlert size={12} className="text-military" />
            تخریب ثبات سیاسی هدف:
          </span>
          <span className="font-bold text-military">
            -{estimatedStabilityDrain}% / نوبت
          </span>
        </div>

        <button
          onClick={handleApplyProxy}
          className="w-full py-2.5 bg-military/15 hover:bg-military/25 text-military border border-military/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          تزریق بودجه عملیات پنهان
        </button>
      </div>
    </div>
  );
}
