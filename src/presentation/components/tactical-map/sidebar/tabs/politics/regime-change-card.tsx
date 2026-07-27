import React from "react";
import { RefreshCw, Zap } from "lucide-react";

interface RegimeChangeCardProps {
  governmentType: string;
}

export function RegimeChangeCard({ governmentType }: RegimeChangeCardProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <RefreshCw size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          تغییر رژیم سیاسی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-2.5">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          نظام فعلی حاکمیت:{" "}
          <strong className="text-foreground">{governmentType}</strong>
        </p>
        <button
          onClick={() => alert("درخواست تغییر رژیم ثبت شد.")}
          className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap size={14} className="text-treasury" />
          <span>برگزاری همه‌پرسی تغییر حکومت</span>
        </button>
      </div>
    </div>
  );
}
