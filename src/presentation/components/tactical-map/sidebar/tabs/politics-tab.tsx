import React from "react";
import { Landmark, RefreshCw, ShieldCheck, Zap } from "lucide-react";

interface PoliticsTabProps {
  taxRate: number;
  governmentType: string;
}

export function PoliticsTab({ taxRate, governmentType }: PoliticsTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
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

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck size={13} className="text-gdp" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            پروژه‌های مبارزه با فساد
          </span>
        </div>

        <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">بودجه بازرسی ملی</span>
            <span className="font-mono font-bold text-gdp">$25,000</span>
          </div>
          <button
            onClick={() => alert("پویش ضدفساد آغاز شد.")}
            className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border cursor-pointer"
          >
            تزریق بودجه مبارزه با فساد
          </button>
        </div>
      </div>
    </div>
  );
}
