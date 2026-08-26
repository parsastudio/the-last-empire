import React from "react";
import { Shield, ShieldAlert, Plane, Radio } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { UnitDeploymentSlider } from "@/presentation/components/tactical-map/modals/attack/unit-deployment-slider";
import { AttackHeader } from "@/presentation/components/tactical-map/modals/attack/attack-header";
import { AttackStatusAlerts } from "@/presentation/components/tactical-map/modals/attack/attack-status-alerts";
import { AttackCostSummary } from "@/presentation/components/tactical-map/modals/attack/attack-cost-summary";
import { AttackIntelPanel } from "@/presentation/components/tactical-map/modals/attack/attack-intel-panel";
import { useDirectAttackForm } from "@/presentation/components/tactical-map/modals/attack/use-direct-attack-form";

interface DirectAttackModalProps {
  isOpen: boolean;
  targetNationId: string | null;
  targetProvinceId?: number | null;
  humanNation: Nation | null;
  gameState: GameState | null;
  onClose: () => void;
}

export function DirectAttackModal({
  isOpen,
  targetNationId,
  targetProvinceId = null,
  humanNation,
  gameState,
  onClose,
}: DirectAttackModalProps) {
  const form = useDirectAttackForm({
    targetNationId,
    targetProvinceId,
    humanNation,
    gameState,
    isOpen,
    onClose,
  });

  if (!isOpen || !form.targetNation || !humanNation) return null;

  const modalTitle = form.isLandNeighbor
    ? "اتاق فرماندهی و تهاجم مستقیم زمینی"
    : form.navalAttackInfo.isNavalValid
      ? "اتاق فرماندهی و عملیات هجوم دریایی"
      : "اتاق فرماندهی عملیات نظامی";

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={modalTitle}
      maxWidthClass="max-w-2xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <AttackHeader
          attackerName={humanNation.name}
          attackerCode={humanNation.id}
          attackerFlagCode={humanNation.flagCode || humanNation.id}
          defenderName={form.targetNation.name}
          defenderCode={form.targetNation.id}
          defenderFlagCode={form.targetNation.flagCode || form.targetNation.id}
          originRegionName={form.originRegionName}
          targetRegionName={form.targetRegionName}
          isLandNeighbor={form.isLandNeighbor}
        />

        <AttackIntelPanel
          isReconActive={form.isReconActive}
          reconCost={form.reconCost}
          canAffordRecon={form.canAffordRecon}
          isExecutingRecon={form.isExecutingRecon}
          targetNation={form.targetNation}
          forecast={form.forecast}
          onExecuteRecon={form.handleExecuteQuickRecon}
          onAutoOptimizeDeploy={form.handleAutoOptimizeDeploy}
        />

        <AttackStatusAlerts
          isLandNeighbor={form.isLandNeighbor}
          isNavalValid={form.navalAttackInfo.isNavalValid}
          isWarStance={form.isWarStance}
          currentStance={form.currentStance}
          reputationPenalty={form.reputationPenalty}
          targetNationName={form.targetNation.name}
          targetRegionName={form.targetRegionName}
        />

        <div className="space-y-2.5">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono block px-1">
            تخصیص ترکیب یگان‌های رزمی به میدان نبرد
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <UnitDeploymentSlider
              label="پیاده‌نظام رزمی"
              unitName="یگان"
              icon={Shield}
              iconColorClass="text-primary"
              availableCount={humanNation.military.infantry}
              selectedCount={form.infantryToDeploy}
              onChange={form.setInfantryToDeploy}
            />

            <UnitDeploymentSlider
              label="لشکر زرهی و تانک‌ها"
              unitName="یگان"
              icon={ShieldAlert}
              iconColorClass="text-military"
              availableCount={humanNation.military.armor || 0}
              selectedCount={form.armorToDeploy}
              onChange={form.setArmorToDeploy}
            />

            <UnitDeploymentSlider
              label="اسکادران جنگنده‌ها"
              unitName="فروند"
              icon={Plane}
              iconColorClass="text-gdp"
              availableCount={humanNation.military.airForce}
              selectedCount={form.airForceToDeploy}
              onChange={form.setAirForceToDeploy}
            />

            <UnitDeploymentSlider
              label="پهپاد و موشک‌های نقطه‌زن"
              unitName="یگان"
              icon={Radio}
              iconColorClass="text-treasury"
              availableCount={humanNation.military.droneMissile}
              selectedCount={form.dronesToLaunch}
              onChange={form.setDronesToLaunch}
            />
          </div>
        </div>

        <AttackCostSummary
          baseDeploymentCost={form.baseDeploymentCost}
          navalTransportExtraCost={form.navalTransportExtraCost}
          isNaval={form.isNavalOperation}
          totalLogisticsCost={form.totalLogisticsCost}
          currentTreasury={humanNation.treasury}
          canAfford={form.canAfford}
          hasSelectedInfantry={form.hasSelectedInfantry}
          isSubmitting={form.isSubmitting}
          targetRegionName={form.targetRegionName}
          isLandNeighbor={form.isLandNeighbor}
          isNavalValid={form.navalAttackInfo.isNavalValid}
          onExecute={form.handleExecuteAttack}
        />
      </div>
    </UnifiedModalShell>
  );
}
