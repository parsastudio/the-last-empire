import React from "react";
import { HeartHandshake } from "lucide-react";
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

      <DiplomacyStepDownActions
        currentStance={currentStance}
        onCancelTreaty={onCancelTreaty}
        onDeclareWar={onDeclareWar}
      />
    </div>
  );
}
