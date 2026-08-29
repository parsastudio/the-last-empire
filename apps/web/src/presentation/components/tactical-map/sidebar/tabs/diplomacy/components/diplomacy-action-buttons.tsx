import React from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  HeartHandshake,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Lock,
  Handshake,
  Skull,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import {
  DiplomaticStance,
  SecurityGuaranteeValidationResult,
} from "@geopolitics/domain";

interface DiplomacyActionButtonsProps {
  currentStance: DiplomaticStance | string;
  foreignAidCost: number;
  securityGuaranteeCost: number;
  emergencyProtectorateCost: number;
  hasSecurityGuarantee?: boolean;
  isEmergencyProtectorate?: boolean;
  guaranteeValidation?: SecurityGuaranteeValidationResult;
  emergencyValidation?: SecurityGuaranteeValidationResult;
  onSendAid: () => void;
  onPeaceTreaty: () => void;
  onNonAggression: () => void;
  onStrategicPartnership: () => void;
  onSecurityGuarantee: () => void;
  onEmergencyProtectorate: () => void;
  onCancelSecurityGuarantee: () => void;
  onCancelEmergencyProtectorate: () => void;
  onCancelTreaty: () => void;
  onDeclareWar: () => void;
}

export function DiplomacyActionButtons({
  currentStance,
  foreignAidCost,
  securityGuaranteeCost,
  emergencyProtectorateCost,
  hasSecurityGuarantee = false,
  isEmergencyProtectorate = false,
  guaranteeValidation,
  emergencyValidation,
  onSendAid,
  onPeaceTreaty,
  onNonAggression,
  onStrategicPartnership,
  onSecurityGuarantee,
  onEmergencyProtectorate,
  onCancelSecurityGuarantee,
  onCancelEmergencyProtectorate,
  onCancelTreaty,
  onDeclareWar,
}: DiplomacyActionButtonsProps) {
  const isWar = currentStance === "WAR";

  const renderStepUpAction = () => {
    if (isWar) {
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
  };

  const renderSecurityUmbrellaBlock = () => {
    if (isEmergencyProtectorate) {
      return (
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/60 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-black">
              <Skull size={16} className="text-rose-400 animate-pulse" />
              <span>تحت‌الحمایگی استعماری فعال (۳ برابر GDP نیرو)</span>
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-bold">
              {PersianNumberFormatter.formatCurrency(
                emergencyProtectorateCost,
                true,
              )}{" "}
              / نوبت (۳۰٪ خراج)
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            استقرار ارتش فوق‌پیشرفته ابرقدرت در سنگرهای شما با پرداخت ۳۰٪ خراج
            نوبتی.
          </p>
          <button
            onClick={onCancelEmergencyProtectorate}
            className="w-full py-2 bg-secondary/80 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 border border-border/60 hover:border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldX size={13} />
            <span>لغو معاهده استعماری و احیای استقلال کامل</span>
          </button>
        </div>
      );
    }

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

    if (isWar) {
      const isEligibleEmergency = emergencyValidation?.isValid ?? false;
      return (
        <div className="space-y-1.5 font-sans">
          <button
            onClick={onEmergencyProtectorate}
            disabled={!isEligibleEmergency}
            className={`w-full p-3.5 rounded-2xl text-right transition-all space-y-1 shadow-md border ${
              isEligibleEmergency
                ? "bg-rose-950/30 hover:bg-rose-950/50 border-rose-500/60 text-rose-300 cursor-pointer"
                : "bg-secondary/40 border-border/60 text-muted-foreground cursor-not-allowed opacity-75"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1.5">
                <Skull size={15} className="text-rose-400" />
                استمداد و معاهده تحت‌الحمایگی استعماری (۳ برابر GDP نیرو)
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-md border bg-rose-500/20 text-rose-300 border-rose-500/40">
                ۳۰٪ خراج
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              استقرار تمام‌قد ارتش ابرقدرت در خاک شما در ازای واگذاری ۳۰٪ درآمد،
              ۳۰- پرستیژ و ۱۵-٪ ثبات.
            </p>
          </button>
        </div>
      );
    }

    const isEligible = guaranteeValidation?.isValid ?? false;
    const reasonText = guaranteeValidation?.reason;

    return (
      <div className="space-y-1.5 font-sans">
        <button
          onClick={onSecurityGuarantee}
          disabled={!isEligible}
          className={`w-full p-3.5 rounded-2xl text-right transition-all space-y-1 shadow-sm border ${
            isEligible
              ? "bg-cyan-950/25 hover:bg-cyan-950/40 border-cyan-500/40 text-cyan-300 cursor-pointer"
              : "bg-secondary/40 border-border/60 text-muted-foreground cursor-not-allowed opacity-75"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black flex items-center gap-1.5">
              {isEligible ? (
                <ShieldCheck size={15} className="text-cyan-400" />
              ) : (
                <Lock size={14} className="text-muted-foreground" />
              )}
              انعقاد پیمان چتر امنیتی و دفاع سرزمینی (
              {PersianNumberFormatter.formatCurrency(
                securityGuaranteeCost,
                true,
              )}{" "}
              / نوبت)
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-md border ${
                isEligible
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                  : "bg-secondary text-muted-foreground border-border/60"
              }`}
            >
              ۱۰٪ GDP
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            اعزام ۳۰٪ نیروی ضربت فوق‌پیشرفته این کشور در زمان دفاع سرزمینی.
          </p>
        </button>

        {!isEligible && reasonText && (
          <div className="px-3 py-1.5 bg-secondary/60 border border-border/60 rounded-xl text-[10px] text-amber-400 flex items-center gap-1.5 font-sans">
            <ShieldAlert size={12} className="shrink-0 text-amber-400" />
            <span>عدم احراز شرایط چتر امنیتی: {reasonText}</span>
          </div>
        )}
      </div>
    );
  };

  const renderStepDownAction = () => {
    if (isWar) return null;

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

      {!isWar && (
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
