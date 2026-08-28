import React from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  HeartHandshake,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { DiplomaticStance } from "@geopolitics/domain";

interface DiplomacyActionButtonsProps {
  currentStance: DiplomaticStance | string;
  foreignAidCost: number;
  securityGuaranteeCost: number;
  hasSecurityGuarantee?: boolean;
  onSendAid: () => void;
  onPeaceTreaty: () => void;
  onNonAggression: () => void;
  onStrategicPartnership: () => void;
  onSecurityGuarantee: () => void;
  onCancelSecurityGuarantee: () => void;
  onCancelTreaty: () => void;
  onDeclareWar: () => void;
}

export function DiplomacyActionButtons({
  currentStance,
  foreignAidCost,
  securityGuaranteeCost,
  hasSecurityGuarantee = false,
  onSendAid,
  onPeaceTreaty,
  onNonAggression,
  onStrategicPartnership,
  onSecurityGuarantee,
  onCancelSecurityGuarantee,
  onCancelTreaty,
  onDeclareWar,
}: DiplomacyActionButtonsProps) {
  const renderStepUpAction = () => {
    if (currentStance === "WAR") {
      return (
        <button
          onClick={onPeaceTreaty}
          className="w-full p-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-right transition-all cursor-pointer space-y-1 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black">
              ارسال معاهده صلح و آتش‌بس (گام رو به بالا: دیپلماسی عادی)
            </span>
            <ArrowUpCircle size={16} className="text-emerald-400" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            پیشنهاد پایان جنگ و بازگشت به روابط عادی بین‌المللی
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
  };

  const renderSecurityUmbrellaBlock = () => {
    if (currentStance === "WAR") return null;

    if (hasSecurityGuarantee) {
      return (
        <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/40 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-black">
              <ShieldCheck size={16} />
              <span>تحت چتر امنیتی این کشور قرار دارید</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {PersianNumberFormatter.formatCurrency(
                securityGuaranteeCost,
                true,
              )}{" "}
              / نوبت
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            در صورت تهاجم دشمن، ۳۰٪ از ارتش فوق‌پیشرفته این کشور در سنگرهای شما
            مستقر می‌شود.
          </p>
          <button
            onClick={onCancelSecurityGuarantee}
            className="w-full py-2 bg-secondary/80 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 border border-border/60 hover:border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldX size={13} />
            <span>فسخ اختیاری پیمان چتر امنیتی</span>
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={onSecurityGuarantee}
        className="w-full p-3.5 rounded-2xl bg-cyan-950/25 hover:bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-right transition-all cursor-pointer space-y-1 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-cyan-400" />
            انعقاد پیمان چتر امنیتی و دفاع سرزمینی (
            {PersianNumberFormatter.formatCurrency(
              securityGuaranteeCost,
              true,
            )}{" "}
            / نوبت)
          </span>
          <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30">
            ۱۰٪ GDP
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          اعزام ۳۰٪ نیروی ضربت فوق‌پیشرفته این کشور به میدان در زمان دفاع
          (استقراض خودکار در صورت کسری بودجه).
        </p>
      </button>
    );
  };

  const renderStepDownAction = () => {
    if (currentStance === "WAR") return null;

    if (currentStance === "NORMAL_DIPLOMACY") {
      return (
        <button
          onClick={onDeclareWar}
          className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-right transition-all cursor-pointer space-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold">
              اعلان جنگ رسمی (قطع روابط و گسیل ارتش)
            </span>
            <ArrowDownCircle size={15} />
          </div>
        </button>
      );
    }

    if (currentStance === "NON_AGGRESSION_PACT") {
      return (
        <div className="space-y-2">
          <button
            onClick={onCancelTreaty}
            className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-right transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">
                لغو پیمان عدم تخاصم (گام رو به پایین: دیپلماسی عادی)
              </span>
              <ArrowDownCircle size={15} className="text-amber-400" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              تنزل قانونی سطح روابط بدون نقض معاهده
            </p>
          </button>

          <button
            onClick={onDeclareWar}
            className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-right transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">
                لغو تعهد و اعلان جنگ مستقیم (با جریمه نقض پیمان)
              </span>
              <ShieldAlert size={15} />
            </div>
          </button>
        </div>
      );
    }

    if (currentStance === "STRATEGIC_PARTNERSHIP") {
      return (
        <div className="space-y-2">
          <button
            onClick={onCancelTreaty}
            className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-right transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">
                لغو شراکت استراتژیک (گام رو به پایین: پیمان عدم تخاصم)
              </span>
              <ArrowDownCircle size={15} className="text-amber-400" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              خروج از شراکت و بازگشت به توافق عدم تعرض
            </p>
          </button>

          <button
            onClick={onDeclareWar}
            className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-right transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold">
                پیمان‌شکنی و اعلان جنگ مستقیم (با جریمه اعتبار)
              </span>
              <ShieldAlert size={15} />
            </div>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-2.5 font-sans">
      {renderStepUpAction()}
      {renderSecurityUmbrellaBlock()}

      {currentStance !== "WAR" && (
        <button
          onClick={onSendAid}
          className="w-full p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500">
              ارسال کمک مالی و دیپلماتیک (
              {PersianNumberFormatter.formatCurrency(foreignAidCost)})
            </span>
            <HeartHandshake size={14} className="text-amber-500" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            بهبود فوری ۲۵+ همسویی و تسهیل پذیرش گام‌های ارتقای روابط
          </p>
        </button>
      )}

      {renderStepDownAction()}
    </div>
  );
}
