import React, { useMemo } from "react";
import { Binary } from "lucide-react";
import {
  DiplomaticStance,
  Province,
  Nation,
  CountryRegistry,
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
  onOpenProxy?: () => void;
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
  onOpenProxy,
}: AdvancedDiplomacyActionsProps) {
  const runner = useDiplomacyActionsRunner({
    targetNationId,
    nationId,
    senderGdp,
    targetGdp,
    currentStance,
    provincesMap,
    clientNation,
    targetNation,
  });

  const isAidSentThisTurn = useMemo(() => {
    if (!clientNation) return false;
    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetNationId);
    const list = clientNation.sentAidTargetIdsThisTurn || [];
    return list.includes(canonicalTarget) || list.includes(targetNationId);
  }, [clientNation, targetNationId]);

  return (
    <>
      <div className="space-y-4 dir-rtl text-right font-sans">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            نردبان معاهدات، چتر امنیتی و مدیریت روابط
          </span>

          <div className="space-y-2.5">
            <TreatyStatusBanner
              stance={currentStance}
              hasSecurityGuarantee={hasSecurityGuarantee}
              isEmergencyProtectorate={isEmergencyProtectorate}
            />

            <DiplomacyActionButtons
              targetName={targetName}
              targetFlagCode={targetFlagCode || targetNation?.flagCode}
              targetNationId={targetNationId}
              currentStance={currentStance}
              foreignAidCost={runner.foreignAidCost}
              securityGuaranteeCost={runner.securityGuaranteeCost}
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

        <div className="pt-3 border-t border-border/60 space-y-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider font-mono block">
            دایره عملیات ویژه اطلاعاتی و سیاه
          </span>

          <button
            onClick={() => {
              if (onOpenProxy) {
                onOpenProxy();
              }
            }}
            className="w-full p-3.5 rounded-2xl bg-secondary/80 hover:bg-secondary border border-border/80 text-right transition-all cursor-pointer space-y-1 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-primary">
                ورود به دایره جاسوسی و خرابکاری در {targetName}
              </span>
              <Binary size={14} className="text-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              اجرای شنود ماهواره‌ای، انهدام پدافند هوایی و سرقت مستقیم اسرار و
              فناوری‌های راهبردی.
            </p>
          </button>
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
