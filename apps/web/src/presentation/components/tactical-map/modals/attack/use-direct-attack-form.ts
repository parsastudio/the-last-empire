"use client";

import { useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { CountryRegistry } from "@/domain/data/countries";
import { useUiStore } from "@/presentation/stores/use-ui-store";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { AttackDeploymentOptimizer } from "@/engine/combat/attack-deployment-optimizer";
import { TacticalEffects } from "@/presentation/utils/tactical-effects";
import { useAttackForcesDeployment } from "./hooks/use-attack-forces-deployment";
import { useAttackForecastCalculator } from "./hooks/use-attack-forecast-calculator";
import { useAttackTerritoryReach } from "./hooks/use-attack-territory-reach";
import { useAttackReputationPenalty } from "./hooks/use-attack-reputation-penalty";
import { useAttackReconRunner } from "./hooks/use-attack-recon-runner";

interface UseDirectAttackFormProps {
  targetNationId: string | null;
  targetProvinceId: number | null;
  humanNation: Nation | null;
  gameState: GameState | null;
  isOpen: boolean;
  onClose: () => void;
}

export function useDirectAttackForm({
  targetNationId,
  targetProvinceId,
  humanNation,
  gameState,
  isOpen,
  onClose,
}: UseDirectAttackFormProps) {
  const { dispatchAction, isSubmitting } = useGameActions();
  const openModal = useUiStore((state) => state.openModal);

  const targetNation = useMemo(() => {
    if (!gameState || !targetNationId) return null;
    const canonical = CountryRegistry.resolveCanonicalId(targetNationId);
    return (
      gameState.nations[targetNationId] || gameState.nations[canonical] || null
    );
  }, [gameState, targetNationId]);

  const targetGuarantorNation = useMemo(() => {
    if (!gameState || !targetNation?.securityGuarantorId) return null;
    const canonical = CountryRegistry.resolveCanonicalId(
      targetNation.securityGuarantorId,
    );
    return (
      gameState.nations[canonical] ||
      gameState.nations[targetNation.securityGuarantorId] ||
      null
    );
  }, [gameState, targetNation]);

  const reach = useAttackTerritoryReach({
    humanNation,
    targetNationName: targetNation?.name,
    targetProvinceId,
    gameState,
  });

  const penalty = useAttackReputationPenalty({
    humanNation,
    targetNation,
  });

  const recon = useAttackReconRunner({
    humanNation,
    targetNation,
    provincesMap: gameState?.provinces,
  });

  const deployment = useAttackForcesDeployment({
    humanNation,
    isOpen,
    targetNationId,
    targetProvinceId,
    attackType: reach.attackType,
  });

  const forecast = useAttackForecastCalculator({
    humanNation,
    targetNation,
    targetGuarantorNation,
    dronesToLaunch: deployment.dronesToLaunch,
    infantryToDeploy: deployment.infantryToDeploy,
    armorToDeploy: deployment.armorToDeploy,
    airForceToDeploy: deployment.airForceToDeploy,
    provincesMap: gameState?.provinces,
  });

  const handleAutoOptimizeDeploy = useCallback(() => {
    if (!humanNation || !targetNation) return;

    const result = AttackDeploymentOptimizer.calculateOptimalDeployment(
      humanNation,
      targetNation,
      gameState?.provinces,
      targetGuarantorNation,
      reach.attackType,
      deployment.navalFleetCount,
    );

    deployment.applyOptimizedDeploy(
      result.drones,
      result.airForce,
      result.armor,
      result.infantry,
    );
  }, [
    humanNation,
    targetNation,
    gameState?.provinces,
    targetGuarantorNation,
    reach.attackType,
    deployment,
  ]);

  const handleExecuteAttack = useCallback(async () => {
    if (
      !humanNation ||
      !targetNation ||
      isSubmitting ||
      !deployment.hasNavalCapacity
    ) {
      return;
    }

    const action = ActionFactory.initiateBattle(
      humanNation.id,
      targetNation.id,
      deployment.dronesToLaunch,
      deployment.infantryToDeploy,
      deployment.armorToDeploy,
      deployment.airForceToDeploy,
      targetProvinceId || undefined,
      reach.attackType,
    );

    const typeLabel = reach.attackType === "NAVAL" ? "دریایی" : "زمینی";
    const res = await dispatchAction(
      action,
      `دستور تهاجم ${typeLabel} به ${reach.targetRegionName} با موفقیت صادر گردید.`,
    );

    if (res.success) {
      onClose();
      if (res.resultData) {
        const report = res.resultData as BattleFullReportData;
        openModal({
          type: "BATTLE_DEBRIEF",
          reportData: report,
        });

        if (report.isAttackerVictory) {
          TacticalEffects.fireVictoryConfetti(160);
        }
      }
    }
  }, [
    humanNation,
    targetNation,
    isSubmitting,
    deployment,
    targetProvinceId,
    reach.attackType,
    reach.targetRegionName,
    dispatchAction,
    onClose,
    openModal,
  ]);

  return {
    targetNation,
    targetGuarantorNation,
    targetProvince: reach.targetProvince,
    isLandNeighbor: reach.isLandNeighbor,
    isNavalValid: reach.isNavalValid,
    attackType: reach.attackType,
    navalFleetCount: deployment.navalFleetCount,
    hasNavalCapacity: deployment.hasNavalCapacity,
    isReconActive: recon.isReconActive,
    reconCost: recon.reconCost,
    canAffordRecon: recon.canAffordRecon,
    isExecutingRecon: recon.isExecutingRecon,
    currentStance: penalty.currentStance,
    isWarStance: penalty.isWarStance,
    reputationPenalty: penalty.reputationPenalty,
    originRegionName: reach.originRegionName,
    targetRegionName: reach.targetRegionName,
    forecast,
    infantryToDeploy: deployment.infantryToDeploy,
    setInfantryToDeploy: deployment.setInfantryToDeploy,
    armorToDeploy: deployment.armorToDeploy,
    setArmorToDeploy: deployment.setArmorToDeploy,
    airForceToDeploy: deployment.airForceToDeploy,
    setAirForceToDeploy: deployment.setAirForceToDeploy,
    dronesToLaunch: deployment.dronesToLaunch,
    setDronesToLaunch: deployment.setDronesToLaunch,
    totalLogisticsCost: deployment.totalLogisticsCost,
    canAfford: deployment.canAfford,
    hasSelectedInfantry: deployment.hasSelectedInfantry,
    isSubmitting,
    handleExecuteQuickRecon: recon.handleExecuteQuickRecon,
    handleAutoOptimizeDeploy,
    handleExecuteAttack,
  };
}
