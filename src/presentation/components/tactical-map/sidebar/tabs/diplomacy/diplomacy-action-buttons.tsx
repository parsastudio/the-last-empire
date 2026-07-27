import React from "react";
import { Swords, Handshake, CheckCircle2 } from "lucide-react";

interface DiplomacyActionButtonsProps {
  targetName: string;
}

export function DiplomacyActionButtons({
  targetName,
}: DiplomacyActionButtonsProps) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
        گزینه‌های تعامل و تغییر وضعیت
      </span>

      <div className="space-y-2">
        <button
          onClick={() =>
            alert(
              `اعلام جنگ به ${targetName}: باعث افت شدید ثبات داخلی، افت اعتبار جهانی و افزایش فوری فرسایش جنگی خواهد شد.`,
            )
          }
          className="w-full p-3 rounded-xl bg-military/10 hover:bg-military/20 border border-military/30 text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-military">
              اعلام جنگ رسمی
            </span>
            <Swords size={13} className="text-military" />
          </div>
          <p className="text-[9px] text-muted-foreground">
            هزینه: افت شدید ثبات سیاسی و شوک اقتصادی.
          </p>
        </button>

        <button
          onClick={() =>
            alert(`ارسال پیشنهاد پیمان عدم تخاصم به ${targetName}`)
          }
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              پیشنهاد پیمان عدم تخاصم
            </span>
            <Handshake size={13} className="text-treasury" />
          </div>
          <p className="text-[9px] text-muted-foreground">
            هزینه: نیاز به نظر مثبت و تایید طرف مقابل.
          </p>
        </button>

        <button
          onClick={() => alert(`ارسال درخواست اتحاد کامل به ${targetName}`)}
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              پیشنهاد اتحاد نظامی کامل
            </span>
            <CheckCircle2 size={13} className="text-gdp" />
          </div>
          <p className="text-[9px] text-muted-foreground">
            هزینه: نیاز به هم‌نظر بودن بالا و اعتبار دیپلماتیک.
          </p>
        </button>
      </div>
    </div>
  );
}
