import React from "react";
import { Terminal, Milestone, Landmark } from "lucide-react";

export function BriefingPanel() {
  return (
    <div className="bg-card/40 backdrop-blur-md border border-border rounded-3xl p-6 space-y-4 max-w-sm w-full shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border/80">
        <Terminal size={14} className="text-primary" />
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          گزارش اطلاعاتی ستاد ارتش
        </span>
      </div>
      <div className="space-y-3.5 text-right">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Milestone size={12} className="text-military" />
            <span>بهینه‌سازی مرزهای متقارن</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed pr-5">
            کشورهای کوچک و حاشیه‌ای با الگوریتم‌های جدید بین همسایگان تقسیم
            شده‌اند تا موازنه قدرت برقرار شود.
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Landmark size={12} className="text-treasury" />
            <span>شبیه‌ساز مالی IMF و بانکداری پویا</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed pr-5">
            سیستم‌های اعتبار سنتی با ساختارهای بازرگانی پیشرفته، محاسبات تعرفه
            گمرک و بهره‌های متغیر همگام شده‌اند.
          </p>
        </div>
      </div>
    </div>
  );
}
