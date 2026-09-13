import React from "react";
import { useTranslations } from "next-intl";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation, GameState } from "@geopolitics/domain";
import { UnitDeploymentSlider } from "@/presentation/components/tactical-map/modals/attack/unit-deployment-slider";
import { AttackHeader } from "@/presentation/components/tactical-map/modals/attack/attack-header";
import { AttackStatusAlerts } from "@/presentation/components/tactical-map/modals/attack/attack-status-alerts";
import { AttackCostSummary } from "@/presentation/components/tactical-map/modals/attack/attack-cost-summary";
import { AttackIntelPanel } from "@/presentation/components/tactical-map/modals/attack/attack-intel-panel";
import { NavalTransportCapacityCard } from "@/presentation/components/tactical-map/modals/attack/naval-transport-capacity-card";
import { useDirectAttackForm } from "@/presentation/components/tactical-map/modals/attack/use-direct-attack-form";
import { MILITARY_UNIT_VISUALS } from "@/presentation/configs/military-unit-visuals.config";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const t = useTranslations("attack");
  const tMil = useTranslations("military");
  const { formatCountryName } = useLocaleFormatter();

  const form = useDirectAttackForm({
    targetNationId,
    targetProvinceId,
    humanNation,
    gameState,
    isOpen,
    onClose,
  });

  if (!isOpen || !form.targetNation || !humanNation) return null;

  const modalTitle =
    form.attackType === "NAVAL" ? t("modalTitleNaval") : t("modalTitleLand");

  const attackerDisplayName = formatCountryName(humanNation);
  const defenderDisplayName = formatCountryName(form.targetNation);

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={modalTitle}
      maxWidthClass="max-w-2xl"
      onClose={onClose}
    >
      <div className="space-y-2.5 md:space-y-4 text-start font-sans">
        <AttackHeader
          attackerName={attackerDisplayName}
          attackerCode={humanNation.id}
          attackerFlagCode={humanNation.flagCode || humanNation.id}
          defenderName={defenderDisplayName}
          defenderCode={form.targetNation.id}
          defenderFlagCode={form.targetNation.flagCode || form.targetNation.id}
          originRegionName={form.originRegionName}
          targetRegionName={form.targetRegionName}
          targetProvinceId={form.targetProvinceId}
          attackType={form.attackType}
        />

        {form.attackType === "NAVAL" && (
          <NavalTransportCapacityCard
            navalFleetCount={form.navalFleetCount}
            infantryDeployed={form.infantryToDeploy}
            armorDeployed={form.armorToDeploy}
          />
        )}

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
          isNavalValid={form.isNavalValid}
          isWarStance={form.isWarStance}
          currentStance={form.currentStance}
          reputationPenalty={form.reputationPenalty}
          targetNationName={defenderDisplayName}
          targetRegionName={form.targetRegionName}
          targetProvinceId={form.targetProvinceId}
          hasAlreadyAttackedThisTurn={form.hasAlreadyAttackedThisTurn}
          activeGuarantorNames={form.activeGuarantorNames}
          mutualGuarantorNames={form.mutualGuarantorNames}
          partnerGuarantorNames={form.partnerGuarantorNames}
        />

        <div className="space-y-2 md:space-y-2.5">
          <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-wider font-mono block px-1">
            {t("slider.sectionTitle")}
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2.5">
            <UnitDeploymentSlider
              label={tMil("INFANTRY.name")}
              unitName={tMil("INFANTRY.unit")}
              icon={MILITARY_UNIT_VISUALS.INFANTRY.icon}
              iconColorClass={MILITARY_UNIT_VISUALS.INFANTRY.colorClass}
              availableCount={humanNation.military.infantry}
              selectedCount={form.infantryToDeploy}
              onChange={form.setInfantryToDeploy}
            />

            <UnitDeploymentSlider
              label={tMil("ARMOR.name")}
              unitName={tMil("ARMOR.unit")}
              icon={MILITARY_UNIT_VISUALS.ARMOR.icon}
              iconColorClass={MILITARY_UNIT_VISUALS.ARMOR.colorClass}
              availableCount={humanNation.military.armor || 0}
              selectedCount={form.armorToDeploy}
              onChange={form.setArmorToDeploy}
            />

            <UnitDeploymentSlider
              label={tMil("AIR_FORCE.name")}
              unitName={tMil("AIR_FORCE.unit")}
              icon={MILITARY_UNIT_VISUALS.AIR_FORCE.icon}
              iconColorClass={MILITARY_UNIT_VISUALS.AIR_FORCE.colorClass}
              availableCount={humanNation.military.airForce}
              selectedCount={form.airForceToDeploy}
              onChange={form.setAirForceToDeploy}
            />

            <UnitDeploymentSlider
              label={tMil("DRONE_MISSILE.name")}
              unitName={tMil("DRONE_MISSILE.unit")}
              icon={MILITARY_UNIT_VISUALS.DRONE_MISSILE.icon}
              iconColorClass={MILITARY_UNIT_VISUALS.DRONE_MISSILE.colorClass}
              availableCount={humanNation.military.droneMissile}
              selectedCount={form.dronesToLaunch}
              onChange={form.setDronesToLaunch}
            />
          </div>
        </div>

        <AttackCostSummary
          totalLogisticsCost={form.totalLogisticsCost}
          currentTreasury={humanNation.treasury}
          canAfford={form.canAfford}
          hasSelectedInfantry={form.hasSelectedInfantry}
          isSubmitting={form.isSubmitting}
          targetRegionName={form.targetRegionName}
          isLandNeighbor={form.isLandNeighbor}
          isNavalValid={form.isNavalValid}
          hasNavalCapacity={form.hasNavalCapacity}
          hasAlreadyAttackedThisTurn={form.hasAlreadyAttackedThisTurn}
          attackType={form.attackType}
          onExecute={form.handleExecuteAttack}
        />
      </div>
    </UnifiedModalShell>
  );
}
