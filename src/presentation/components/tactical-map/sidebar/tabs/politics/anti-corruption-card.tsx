import React from "react";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/presentation/context/toast-context";

export function AntiCorruptionCard() {
  const { showToast } = useToast();

  const handleAntiCorruption = () => {
    showToast(
      "پویش ضدفساد ملی",
      "مبلغ $25,000 به آژانس بازرسی ملی تزریق شد و شاخص فساد اداری ۵٪ کاهش یافت.",
      "success",
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <ShieldCheck size={13} className="text-gdp" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          پروژه‌های مبارزه با فساد
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            بودجه بازرسی ملی:
          </span>
          <span className="font-bold text-gdp">$25,000</span>
        </div>
        <button
          onClick={handleAntiCorruption}
          className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border cursor-pointer"
        >
          تزریق بودجه مبارزه با فساد (-۵٪ فساد)
        </button>
      </div>
    </div>
  );
}
