import React from "react";
import { ShieldAlert, ShieldCheck, ShieldX, Lock, Skull } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { SecurityGuaranteeValidationResult } from "@geopolitics/domain";

interface DiplomacySecurityUmbrellaActionsProps {
  isWar: boolean;
  hasSecurityGuarantee?: boolean;
  isEmergencyProtectorate?: boolean;
  securityGuaranteeCost: number;
  emergencyProtectorateCost: number;
  guaranteeValidation?: SecurityGuaranteeValidationResult;
  emergencyValidation?: SecurityGuaranteeValidationResult;
  onSecurityGuarantee: () => void;
  onEmergencyProtectorate: () => void;
  onCancelSecurityGuarantee: () => void;
  onCancelEmergencyProtectorate: () => void;
}

export function DiplomacySecurityUmbrellaActions({
  isWar,
  hasSecurityGuarantee = false,
  isEmergencyProtectorate = false,
  securityGuaranteeCost,
  emergencyProtectorateCost,
  guaranteeValidation,
  emergencyValidation,
  onSecurityGuarantee,
  onEmergencyProtectorate,
  onCancelSecurityGuarantee,
  onCancelEmergencyProtectorate,
}: DiplomacySecurityUmbrellaActionsProps) {
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
            {PersianNumberFormatter.formatCurrency(securityGuaranteeCost, true)}{" "}
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
            {PersianNumberFormatter.formatCurrency(securityGuaranteeCost, true)}{" "}
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
}
