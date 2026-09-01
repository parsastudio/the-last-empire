import React, { useState } from "react";
import { ShieldCheck, ShieldX, Skull } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { SecurityGuaranteeValidationResult } from "@geopolitics/domain";
import { SecurityGuaranteeModal } from "../modals/security-guarantee-modal";

interface DiplomacySecurityUmbrellaActionsProps {
  targetName: string;
  targetFlagCode?: string;
  targetNationId: string;
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
  targetName,
  targetFlagCode,
  targetNationId,
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isEmergencyProtectorate) {
    return (
      <div className="p-3.5 bg-rose-950/40 border border-rose-500/60 rounded-2xl space-y-2 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-black">
            <Skull size={16} className="text-rose-400 animate-pulse" />
            <span>تحت‌الحمایگی استعماری فعال (۵۰٪ GDP نیرو)</span>
          </div>
          <span className="text-[10px] font-mono text-rose-400 font-bold">
            {PersianNumberFormatter.formatCurrency(
              emergencyProtectorateCost,
              true,
            )}{" "}
            / نوبت (۵٪ خراج)
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          استقرار ارتش فوق‌پیشرفته ابرقدرت در سنگرهای شما با پرداخت ۵٪ خراج
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
      <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/40 rounded-2xl space-y-2 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-black">
            <ShieldCheck size={16} />
            <span>تحت چتر امنیتی این کشور قرار دارید</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">
            {PersianNumberFormatter.formatCurrency(securityGuaranteeCost, true)}{" "}
            / نوبت (۲٪ GDP)
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          در صورت تهاجم دشمن، ۶٪ از ارتش مدرن این کشور در سنگرهای شما مستقر
          می‌شود.
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

  const defaultValidation: SecurityGuaranteeValidationResult = {
    isValid: false,
    gdpRatio: 1,
    techDiff: 0,
    tension: 0,
    isGdpValid: false,
    isTechValid: false,
    isTensionValid: false,
    isNotWar: !isWar,
  };

  const activeValidation = isWar
    ? emergencyValidation || defaultValidation
    : guaranteeValidation || defaultValidation;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full p-3.5 rounded-2xl bg-cyan-950/25 hover:bg-cyan-950/45 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-right transition-all cursor-pointer space-y-1 shadow-sm font-sans"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black flex items-center gap-2">
            <ShieldCheck size={16} className="text-cyan-400" />
            <span>پیمان چتر امنیتی و دفاع سرزمینی</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg border bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            بررسی شروط
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          مشاهده چک‌لیست شروط چهارگانه و انعقاد تضمین دفاعی با اعزام نیروی ضربت.
        </p>
      </button>

      <SecurityGuaranteeModal
        isOpen={isModalOpen}
        targetName={targetName}
        targetFlagCode={targetFlagCode}
        targetNationId={targetNationId}
        isWar={isWar}
        costPerTurn={isWar ? emergencyProtectorateCost : securityGuaranteeCost}
        validation={activeValidation}
        onConfirmGuarantee={
          isWar ? onEmergencyProtectorate : onSecurityGuarantee
        }
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
