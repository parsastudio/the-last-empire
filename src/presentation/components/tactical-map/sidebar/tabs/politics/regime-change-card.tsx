import React from "react";
import { RefreshCw, Zap, AlertTriangle } from "lucide-react";
import { useToast } from "@/presentation/context/toast-context";

interface RegimeChangeCardProps {
  governmentType: string;
}

export function RegimeChangeCard({ governmentType }: RegimeChangeCardProps) {
  const { showToast } = useToast();

  const handleRegimeChange = () => {
    showToast(
      "درخواست تغییر رژیم",
      "فرآیند برگزاری همه‌پرسی تغییر حکومت آغاز شد. -۴۰٪ جریمه ثبات سیاسی اعمال گردید.",
      "warning",
    );
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <RefreshCw size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تغییر رژیم سیاسی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          نظام فعلی حاکمیت:{" "}
          <strong className="text-foreground">{governmentType}</strong>
        </p>

        <div className="bg-military/10 border border-military/30 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-military font-mono">
          <AlertTriangle size={13} className="shrink-0" />
          <span className="font-sans">
            هشدار: تغییر حکومت باعث افت فوری ۴۰٪ ثبات و دوره ۱۵ نوبتی قفل مجدد
            خواهد شد.
          </span>
        </div>

        <button
          onClick={handleRegimeChange}
          className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap size={14} className="text-treasury" />
          <span>برگزاری همه‌پرسی تغییر حکومت</span>
        </button>
      </div>
    </div>
  );
}
