import React from "react";
import { Swords, Handshake, CheckCircle2, Shield, Coins } from "lucide-react";
import { useToast } from "@/presentation/context/toast-context";

interface AdvancedDiplomacyActionsProps {
  targetName: string;
  onOpenTributeModal?: () => void;
}

export function AdvancedDiplomacyActions({
  targetName,
  onOpenTributeModal,
}: AdvancedDiplomacyActionsProps) {
  const { showToast } = useToast();

  const handleDeclareWar = () => {
    showToast(
      "اعلام جنگ رسمی",
      `بیانیه رسمی اعلام جنگ به ${targetName} صادر شد.`,
      "error",
    );
  };

  const handleMilitaryAccess = () => {
    showToast(
      "درخواست حق عبور",
      `درخواست ترانزیت نظامی به ${targetName} ارسال گردید.`,
      "info",
    );
  };

  const handleNonAggression = () => {
    showToast(
      "پیشنهاد عدم تخاصم",
      `پیشنهاد رسمی پیمان عدم تخاصم به ${targetName} ابلاغ گردید.`,
      "info",
    );
  };

  const handleAlliance = () => {
    showToast(
      "درخواست اتحاد کامل",
      `پیشنهاد معاهده دفاعی مشترک به ${targetName} ارسال گردید.`,
      "success",
    );
  };

  return (
    <div className="space-y-2 dir-rtl text-right">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
        گزینه‌های تعامل و دیپلماسی پیشرفته
      </span>

      <div className="space-y-2">
        <button
          onClick={handleDeclareWar}
          className="w-full p-3 rounded-xl bg-military/10 hover:bg-military/20 border border-military/30 text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-military">
              اعلام جنگ رسمی
            </span>
            <Swords size={13} className="text-military" />
          </div>
          <p className="text-[9px] text-muted-foreground">
            هزینه: افت ثبات سیاسی (+۳ افزایش پرخاشگری جهانی).
          </p>
        </button>

        <button
          onClick={handleMilitaryAccess}
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
          onClick={() => {
            if (onOpenTributeModal) {
              onOpenTributeModal();
            } else {
              showToast(
                "مطالبه باج",
                `درخواست باج از ${targetName}`,
                "warning",
              );
            }
          }}
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              مطالبه باج و باج‌گیری اقتصادی
            </span>
            <Coins size={13} className="text-gdp" />
          </div>
          <p className="text-[9px] text-muted-foreground">
            تعیین مبلغ باج نوبتی تا سقف ۱۰٪ از کل خزانه کشور هدف.
          </p>
        </button>

        <button
          onClick={handleNonAggression}
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
          onClick={handleAlliance}
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
