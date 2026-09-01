import React from "react";
import { HeartHandshake, CheckCircle2 } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import {
  DiplomaticStance,
  SecurityGuaranteeValidationResult,
} from "@geopolitics/domain";
import { DiplomacyStepUpActions } from "./diplomacy-step-up-actions";
import { DiplomacySecurityUmbrellaActions } from "./diplomacy-security-umbrella-actions";
import { DiplomacyStepDownActions } from "./diplomacy-step-down-actions";

interface DiplomacyActionButtonsProps {
  targetName: string;
  targetFlagCode?: string;
  targetNationId: string;
  currentStance: DiplomaticStance | string;
  foreignAidCost: number;
  securityGuaranteeCost: number;
  emergencyProtectorateCost: number;
  hasSecurityGuarantee?: boolean;
  isEmergencyProtectorate?: boolean;
  isAidSentThisTurn?: boolean;
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
  targetName,
  targetFlagCode,
  targetNationId,
  currentStance,
  foreignAidCost,
  securityGuaranteeCost,
  emergencyProtectorateCost,
  hasSecurityGuarantee = false,
  isEmergencyProtectorate = false,
  isAidSentThisTurn = false,
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

  return (
    <div className="space-y-2.5 font-sans">
      <DiplomacyStepUpActions
        currentStance={currentStance}
        onPeaceTreaty={onPeaceTreaty}
        onNonAggression={onNonAggression}
        onStrategicPartnership={onStrategicPartnership}
      />

      <DiplomacySecurityUmbrellaActions
        targetName={targetName}
        targetFlagCode={targetFlagCode}
        targetNationId={targetNationId}
        isWar={isWar}
        hasSecurityGuarantee={hasSecurityGuarantee}
        isEmergencyProtectorate={isEmergencyProtectorate}
        securityGuaranteeCost={securityGuaranteeCost}
        emergencyProtectorateCost={emergencyProtectorateCost}
        guaranteeValidation={guaranteeValidation}
        emergencyValidation={emergencyValidation}
        onSecurityGuarantee={onSecurityGuarantee}
        onEmergencyProtectorate={onEmergencyProtectorate}
        onCancelSecurityGuarantee={onCancelSecurityGuarantee}
        onCancelEmergencyProtectorate={onCancelEmergencyProtectorate}
      />

      {!isWar && (
        <button
          onClick={onSendAid}
          disabled={isAidSentThisTurn}
          className={`w-full p-3 rounded-2xl border text-right transition-all space-y-1 ${
            isAidSentThisTurn
              ? "bg-secondary/40 border-border/60 text-muted-foreground cursor-not-allowed opacity-75"
              : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-500 cursor-pointer shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold flex items-center gap-1.5">
              {isAidSentThisTurn ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-foreground">
                    بسته کمک مالی در این نوبت واریز شد
                  </span>
                </>
              ) : (
                `ارسال کمک مالی و دیپلماتیک (${PersianNumberFormatter.formatCurrency(foreignAidCost)})`
              )}
            </span>
            <HeartHandshake
              size={14}
              className={
                isAidSentThisTurn ? "text-muted-foreground" : "text-amber-500"
              }
            />
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {isAidSentThisTurn
              ? "سهمیه کمک مالی به این کشور در نوبت جاری تکمیل شده است (امکان ارسال مجدد در نوبت بعد)."
              : "بهبود فوری ۲۵+ همسویی و ۱۵- تنش دوجانبه (۱+ اعتبار جهانی)."}
          </p>
        </button>
      )}

      <DiplomacyStepDownActions
        currentStance={currentStance}
        onCancelTreaty={onCancelTreaty}
        onDeclareWar={onDeclareWar}
      />
    </div>
  );
}
