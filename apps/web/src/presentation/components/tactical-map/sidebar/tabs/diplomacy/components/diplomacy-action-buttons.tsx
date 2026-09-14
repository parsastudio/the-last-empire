import React from "react";
import { useTranslations } from "next-intl";
import { HeartHandshake, CheckCircle2, Coins } from "lucide-react";
import {
  DiplomaticStance,
  SecurityGuaranteeValidationResult,
} from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
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
  strategicPartnershipCost?: number;
  strategicPartnershipDividend?: number;
  canAffordPartnership?: boolean;
  canAffordAid?: boolean;
  canDeclareWar?: boolean;
  isPeaceCooldownActive?: boolean;
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
  strategicPartnershipCost = 0,
  strategicPartnershipDividend = 0,
  canAffordPartnership = true,
  canAffordAid = true,
  canDeclareWar = true,
  isPeaceCooldownActive = false,
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
  const t = useTranslations("diplomacy");
  const { formatCurrency } = useLocaleFormatter();
  const isWar = currentStance === "WAR";
  const isAidDisabled = isAidSentThisTurn || !canAffordAid;

  return (
    <div className="space-y-2.5 font-sans">
      <DiplomacyStepUpActions
        currentStance={currentStance}
        strategicPartnershipCost={strategicPartnershipCost}
        strategicPartnershipDividend={strategicPartnershipDividend}
        canAffordPartnership={canAffordPartnership}
        isPeaceCooldownActive={isPeaceCooldownActive}
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
          disabled={isAidDisabled}
          className={`w-full p-3 rounded-2xl border text-start transition-all space-y-1 ${
            isAidDisabled
              ? "bg-secondary/40 border-border/60 text-muted-foreground cursor-not-allowed opacity-60"
              : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-500 cursor-pointer shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold flex items-center gap-1.5 min-w-0">
              {isAidSentThisTurn ? (
                <>
                  <CheckCircle2
                    size={14}
                    className="text-emerald-400 shrink-0"
                  />
                  <span className="text-foreground truncate">
                    {t("actions.foreignAidSent")}
                  </span>
                </>
              ) : (
                <>
                  <HeartHandshake
                    size={14}
                    className="text-amber-500 shrink-0"
                  />
                  <span className="truncate">
                    {t("actions.sendForeignAid", { cost: "" }).trim()}
                  </span>
                </>
              )}
            </span>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border bg-amber-500/15 text-amber-300 border-amber-500/30 shrink-0 flex items-center gap-1">
              <Coins size={11} />
              <span>{formatCurrency(foreignAidCost, true)}</span>
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {isAidSentThisTurn
              ? t("actions.foreignAidQuotaReached")
              : !canAffordAid
                ? t("actions.foreignAidInsufficientDesc")
                : t("actions.sendForeignAidDesc")}
          </p>
        </button>
      )}

      <DiplomacyStepDownActions
        currentStance={currentStance}
        canDeclareWar={canDeclareWar}
        onCancelTreaty={onCancelTreaty}
        onDeclareWar={onDeclareWar}
      />
    </div>
  );
}
