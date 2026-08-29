import React from "react";
import { ArrowUpCircle, Handshake } from "lucide-react";
import { DiplomaticStance } from "@geopolitics/domain";

interface DiplomacyStepUpActionsProps {
  currentStance: DiplomaticStance | string;
  onPeaceTreaty: () => void;
  onNonAggression: () => void;
  onStrategicPartnership: () => void;
}

export function DiplomacyStepUpActions({
  currentStance,
  onPeaceTreaty,
  onNonAggression,
  onStrategicPartnership,
}: DiplomacyStepUpActionsProps) {
  if (currentStance === "WAR") {
    return (
      <button
        onClick={onPeaceTreaty}
        className="w-full p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-right transition-all cursor-pointer space-y-1 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-1.5">
            <Handshake size={16} />
            ورود به میز مذاکرات آتش‌بس و شروط صلح
          </span>
          <ArrowUpCircle size={16} className="text-emerald-400" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          بررسی زنده تراز قوا، بسته غرامت مالی یا واگذاری ارضی برای پایان جنگ
        </p>
      </button>
    );
  }

  if (currentStance === "NORMAL_DIPLOMACY") {
    return (
      <button
        onClick={onNonAggression}
        className="w-full p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-right transition-all cursor-pointer space-y-1 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black">
            پیشنهاد پیمان عدم تخاصم (گام رو به بالا: امنیت مرزی)
          </span>
          <ArrowUpCircle size={16} className="text-emerald-400" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          تثبیت آرامش مرزها و ارتقای سطح روابط سیاسی
        </p>
      </button>
    );
  }

  if (currentStance === "NON_AGGRESSION_PACT") {
    return (
      <button
        onClick={onStrategicPartnership}
        className="w-full p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-right transition-all cursor-pointer space-y-1 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black">
            پیشنهاد شراکت استراتژیک (گام رو به بالا: بالاترین سطح سیاسی)
          </span>
          <ArrowUpCircle size={16} className="text-emerald-400" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          تسهیلات تجاری، تعرفه صفر و یارانه‌های مالی متقابل در زمان جنگ
        </p>
      </button>
    );
  }

  return null;
}
