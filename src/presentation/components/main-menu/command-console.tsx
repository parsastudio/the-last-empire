import React from "react";
import { Play, RotateCcw, ShieldAlert, Cpu } from "lucide-react";

interface CommandConsoleProps {
  onNewCampaign: () => void;
  onLoadCampaign: () => void;
  onTriggerAlert: (message: string) => void;
}

export function CommandConsole({
  onNewCampaign,
  onLoadCampaign,
  onTriggerAlert,
}: CommandConsoleProps) {
  return (
    <div className="flex flex-col gap-3.5 max-w-sm w-full">
      <button
        onClick={onNewCampaign}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all border border-emerald-500/20 shadow-lg shadow-emerald-950/10 hover:shadow-xl hover:translate-y-[-1px] text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
      >
        <Play size={15} fill="currentColor" />
        <span>آغاز کمپین راهبردی جدید</span>
      </button>

      <button
        onClick={onLoadCampaign}
        className="w-full py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
      >
        <RotateCcw size={15} />
        <span>بازیابی آخرین امپراتوری</span>
      </button>

      <div className="w-full border-t border-border/40 my-1" />

      <button
        onClick={() => onTriggerAlert("تنظیمات پروتکل امنیتی غیرفعال است.")}
        className="w-full py-3 bg-secondary/60 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground rounded-xl font-medium transition-all text-[11px] flex items-center justify-center gap-2 cursor-pointer"
      >
        <Cpu size={13} />
        <span>تنظیمات رمزنگاری شبکه فرماندهی</span>
      </button>

      <button
        onClick={() => onTriggerAlert("دسترسی به شبیه‌ساز سناریو مجاز نیست.")}
        className="w-full py-3 bg-secondary/60 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground rounded-xl font-medium transition-all text-[11px] flex items-center justify-center gap-2 cursor-pointer"
      >
        <ShieldAlert size={13} />
        <span>مدیریت سناریوهای بحران تاکتیکی</span>
      </button>
    </div>
  );
}
