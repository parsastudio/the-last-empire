import React from "react";
import { Binary } from "lucide-react";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { BetrayalConfirmModal } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/modals/betrayal-confirm-modal";
import { TreatyStatusBanner } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/treaty-status-banner";
import { useDiplomacyActionsRunner } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/hooks/use-diplomacy-actions-runner";
import { DiplomacyActionButtons } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/components/diplomacy-action-buttons";

interface AdvancedDiplomacyActionsProps {
  targetName: string;
  targetNationId: string;
  nationId: string;
  targetGdp?: number;
  currentStance?: DiplomaticStance | string;
  onOpenProxy?: () => void;
}

export function AdvancedDiplomacyActions({
  targetName,
  targetNationId,
  nationId,
  targetGdp = 100000000000,
  currentStance = "NORMAL_DIPLOMACY",
  onOpenProxy,
}: AdvancedDiplomacyActionsProps) {
  const runner = useDiplomacyActionsRunner({
    targetName,
    targetNationId,
    nationId,
    targetGdp,
    currentStance,
  });

  const isWar = currentStance === "WAR";
  const isSevered = currentStance === "SEVERED_RELATIONS";
  const isAlliance = currentStance === "ALLIANCE";
  const isNonAggression = currentStance === "NON_AGGRESSION_PACT";

  return (
    <>
      <div className="space-y-4 dir-rtl text-right">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            وضعیت‌های سیاسی و معاهدات دوجانبه
          </span>

          <div className="space-y-2">
            <TreatyStatusBanner stance={currentStance} />

            <DiplomacyActionButtons
              isWar={isWar}
              isSevered={isSevered}
              isAlliance={isAlliance}
              isNonAggression={isNonAggression}
              foreignAidCost={runner.foreignAidCost}
              onSendAid={runner.handleSendAid}
              onNonAggression={runner.handleNonAggression}
              onAlliance={runner.handleAlliance}
              onSeverTrade={runner.handleSeverTrade}
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
    </>
  );
}
