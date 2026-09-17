import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  DiplomaticStance,
  Province,
  Nation,
  CountryRegistry,
  NationTurnActivity,
} from "@geopolitics/domain";
import { BetrayalConfirmModal } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/modals/betrayal-confirm-modal";
import { DiplomaticFeedbackModal } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/modals/diplomatic-feedback-modal";
import { TreatyStatusBanner } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/treaty-status-banner";
import { useDiplomacyActionsRunner } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/hooks/use-diplomacy-actions-runner";
import { DiplomacyActionButtons } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/components/diplomacy-action-buttons";

interface AdvancedDiplomacyActionsProps {
  targetName: string;
  targetNationId: string;
  targetFlagCode?: string;
  nationId: string;
  senderGdp?: number;
  targetGdp?: number;
  currentStance?: DiplomaticStance | string;
  hasSecurityGuarantee?: boolean;
  isEmergencyProtectorate?: boolean;
  provincesMap?: Record<string, Province>;
  clientNation?: Nation | null;
  targetNation?: Nation | null;
  currentTurn?: number;
  turnActivity?: NationTurnActivity;
}

export function AdvancedDiplomacyActions({
  targetName,
  targetNationId,
  targetFlagCode,
  nationId,
  senderGdp = 100000000000,
  targetGdp = 100000000000,
  currentStance = "NORMAL_DIPLOMACY",
  hasSecurityGuarantee = false,
  isEmergencyProtectorate = false,
  provincesMap,
  clientNation,
  targetNation,
  currentTurn,
  turnActivity,
}: AdvancedDiplomacyActionsProps) {
  const t = useTranslations("diplomacy");
  const runner = useDiplomacyActionsRunner({
    targetNationId,
    nationId,
    senderGdp,
    targetGdp,
    currentStance,
    provincesMap,
    clientNation,
    targetNation,
    currentTurn,
  });

  const isAidSentThisTurn = useMemo(() => {
    if (!clientNation) return false;
    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetNationId);
    const list = turnActivity?.sentAidTargetIds ?? [];
    return list.includes(canonicalTarget) || list.includes(targetNationId);
  }, [clientNation, targetNationId, turnActivity?.sentAidTargetIds]);

  const canAffordPartnership =
    (clientNation?.treasury ?? 0) >= runner.strategicPartnershipCost;

  const canAffordAid = (clientNation?.treasury ?? 0) >= runner.foreignAidCost;

  return (
    <>
      <div className="space-y-4 text-start font-sans">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            {t("actions.tableTitle")}
          </span>

          <div className="space-y-2.5">
            <TreatyStatusBanner
              stance={currentStance}
              hasSecurityGuarantee={hasSecurityGuarantee}
              isEmergencyProtectorate={isEmergencyProtectorate}
              dividendAmount={runner.strategicPartnershipDividend}
            />

            <DiplomacyActionButtons
              targetName={targetName}
              targetFlagCode={targetFlagCode || targetNation?.flagCode}
              targetNationId={targetNationId}
              currentStance={currentStance}
              foreignAidCost={runner.foreignAidCost}
              securityGuaranteeCost={runner.securityGuaranteeCost}
              strategicPartnershipCost={runner.strategicPartnershipCost}
              strategicPartnershipDividend={runner.strategicPartnershipDividend}
              canAffordPartnership={canAffordPartnership}
              canAffordAid={canAffordAid}
              canDeclareWar={runner.canDeclareWar}
              isPeaceCooldownActive={runner.isPeaceCooldownActive}
              emergencyProtectorateCost={runner.emergencyProtectorateCost}
              hasSecurityGuarantee={hasSecurityGuarantee}
              isEmergencyProtectorate={isEmergencyProtectorate}
              isAidSentThisTurn={isAidSentThisTurn}
              guaranteeValidation={runner.guaranteeValidation}
              emergencyValidation={runner.emergencyValidation}
              onSendAid={runner.handleSendAid}
              onPeaceTreaty={runner.handlePeaceTreaty}
              onNonAggression={runner.handleNonAggression}
              onStrategicPartnership={runner.handleStrategicPartnership}
              onSecurityGuarantee={runner.handleSecurityGuarantee}
              onEmergencyProtectorate={runner.handleEmergencyProtectorate}
              onCancelSecurityGuarantee={runner.handleCancelSecurityGuarantee}
              onCancelEmergencyProtectorate={
                runner.handleCancelEmergencyProtectorate
              }
              onCancelTreaty={runner.handleCancelTreaty}
              onDeclareWar={runner.handleDeclareWar}
            />
          </div>
        </div>
      </div>

      <BetrayalConfirmModal
        isOpen={runner.confirmModal.isOpen}
        targetName={targetName}
        penalty={runner.confirmModal.penalty}
        skippedSteps={runner.confirmModal.skippedSteps}
        onClose={runner.closeConfirmModal}
        onConfirm={runner.acceptConfirmModal}
      />

      <DiplomaticFeedbackModal
        isOpen={runner.feedbackModal !== null}
        feedback={runner.feedbackModal}
        onClose={runner.closeFeedbackModal}
      />
    </>
  );
}
