import React from "react";
import { Swords, Handshake, CheckCircle2, Shield, Coins } from "lucide-react";

interface AdvancedDiplomacyActionsProps {
  targetName: string;
}

export function AdvancedDiplomacyActions({
  targetName,
}: AdvancedDiplomacyActionsProps) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
        گزینه‌های تعامل و دیپلماسی پیشرفته
      </span>

      <div className="space-y-2">
        <button
          onClick={() =>
            alert(
              `اعلام جنگ به ${targetName}: باعث افت شدید ثبات داخلی و شوک اقتصادی خواهد شد.`,
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
            هزینه: افت شدید ثبات سیاسی و افزایش فرسایش جنگی.
          </p>
        </button>

        <button
          onClick={() =>
            alert(`درخواست حق عبور نظامی به ${targetName} ارسال شد.`)
          }
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              درخواست حق عبور نظامی
            </span>
            <Shield size={13} className="text-primary" />
          </div>
          <p className="text-[9px] text-muted-foreground">
            اجازه ترانزیت یگان‌ها از خاک یا آب‌های سرزمینی طرف مقابل.
          </p>
        </button>

        <button
          onClick={() =>
            alert(
              `مطالبه ۵٪ از تولید ناخالص ملی ${targetName} به عنوان باج سالانه.`,
            )
          }
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              مطالبه باج و باج‌گیری اقتصادی
            </span>
            <Coins size={13} className="text-gdp" />
          </div>
          <p className="text-[9px] text-muted-foreground">
            الزام طرف ضعیف‌تر به پرداخت سهمی از درآمد خزانه در هر نوبت.
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
        </button>
      </div>
    </div>
  );
}
