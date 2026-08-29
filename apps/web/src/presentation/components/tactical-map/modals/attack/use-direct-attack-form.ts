"use client";

import { useState, useMemo, useCallback } from "react";
import confetti from "canvas-confetti";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { CountryRegistry } from "@/domain/data/countries";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { useUiStore } from "@/presentation/stores/use-ui-store";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { AttackDeploymentOptimizer } from "@/engine/combat/attack-deployment-optimizer";
import { EspionageCalculator } from "@/engine/espionage/espionage-calculator";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";
import { useAttackForcesDeployment } from "./hooks/use-attack-forces-deployment";
import { useAttackForecastCalculator } from "./hooks/use-attack-forecast-calculator";

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
  const [isExecutingRecon, setIsExecutingRecon] = useState<boolean>(false);

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

  const targetProvince = useMemo(() => {
    if (!gameState || !targetProvinceId) return null;
    return gameState.provinces[targetProvinceId.toString()] || null;
  }, [gameState, targetProvinceId]);

  const isLandNeighbor = useMemo(() => {
    if (!humanNation || !targetProvinceId) return false;
    return LandNeighborResolver.hasProvinceLandBorder(
      targetProvinceId,
      humanNation.id,
      gameState?.provinces,
    );
  }, [humanNation, targetProvinceId, gameState?.provinces]);

  const attackerHasSea = useMemo(() => {
    if (!humanNation) return false;
    return NationGettersUtility.hasSeaAccess(
      humanNation.id,
      gameState?.provinces,
    );
  }, [humanNation, gameState?.provinces]);

  const targetProvinceHasSea = Boolean(targetProvince?.hasSeaAccess);
  const isNavalValid =
    !isLandNeighbor && attackerHasSea && targetProvinceHasSea;
  const attackType: "LAND" | "NAVAL" = isLandNeighbor ? "LAND" : "NAVAL";

  const deployment = useAttackForcesDeployment({
    humanNation,
    isOpen,
    targetNationId,
    targetProvinceId,
    attackType,
  });

  const isReconActive = useMemo(() => {
    if (!humanNation || !targetNation) return false;
    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetNation.id);
    const list = humanNation.executedEspionageTiers || [];
    return (
      list.includes(`${canonicalTarget}:1`) ||
      list.includes(`${targetNation.id}:1`)
    );
  }, [humanNation, targetNation]);

  const targetGdp = useMemo(() => {
    if (!targetNation) return 1000000000;
    return getNationGdp(targetNation, gameState?.provinces);
  }, [targetNation, gameState?.provinces]);

  const reconCost = useMemo(() => {
    return EspionageCalculator.calculateOperationCost(targetGdp, 1);
  }, [targetGdp]);

  const canAffordRecon = (humanNation?.treasury || 0) >= reconCost;
  const originRegionName = humanNation
    ? `خاک ${humanNation.name}`
    : "خاک اصلی کشور";

  const currentStance = useMemo<DiplomaticStance>(() => {
    if (!humanNation || !targetNation) return "NORMAL_DIPLOMACY";
    return NationRelationResolver.getStance(
      humanNation.relations,
      targetNation.id,
    );
  }, [humanNation, targetNation]);

  const isWarStance = currentStance === "WAR";

  const reputationPenalty = useMemo(() => {
    if (isWarStance) return 0;
    if (currentStance === "STRATEGIC_PARTNERSHIP") return 40;
    if (currentStance === "NON_AGGRESSION_PACT") return 25;
    return 15;
  }, [isWarStance, currentStance]);

  const targetRegionName = useMemo(() => {
    if (targetProvince) return targetProvince.nameFa;
    if (!targetNation) return "";
    return `خاک اصلی ${targetNation.name}`;
  }, [targetNation, targetProvince]);

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

  const handleExecuteQuickRecon = useCallback(async () => {
    if (!humanNation || !targetNation || isExecutingRecon || !canAffordRecon) {
      return;
    }
    try {
      setIsExecutingRecon(true);
      const action = ActionFactory.executeEspionage(
        humanNation.id,
        targetNation.id,
        1,
      );
      await dispatchAction(
        action,
        "شنود ماهواره‌ای مواضع دشمن با موفقیت انجام شد.",
      );
    } finally {
      setIsExecutingRecon(false);
    }
  }, [
    humanNation,
    targetNation,
    isExecutingRecon,
    canAffordRecon,
    dispatchAction,
  ]);

  const handleAutoOptimizeDeploy = useCallback(() => {
    if (!humanNation || !targetNation) return;

    const result = AttackDeploymentOptimizer.calculateOptimalDeployment(
      humanNation,
      targetNation,
      gameState?.provinces,
      targetGuarantorNation,
      attackType,
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
    attackType,
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
      attackType,
    );

    const typeLabel = attackType === "NAVAL" ? "دریایی" : "زمینی";
    const res = await dispatchAction(
      action,
      `دستور تهاجم ${typeLabel} به ${targetRegionName} با موفقیت صادر گردید.`,
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
          try {
            confetti({
              particleCount: 160,
              spread: 90,
              origin: { y: 0.65 },
              colors: ["#10b981", "#f59e0b", "#3b82f6", "#ffffff"],
            });
          } catch {}
        }
      }
    }
  }, [
    humanNation,
    targetNation,
    isSubmitting,
    deployment,
    targetProvinceId,
    attackType,
    dispatchAction,
    targetRegionName,
    onClose,
    openModal,
  ]);

  return {
    targetNation,
    targetGuarantorNation,
    targetProvince,
    isLandNeighbor,
    isNavalValid,
    attackType,
    navalFleetCount: deployment.navalFleetCount,
    hasNavalCapacity: deployment.hasNavalCapacity,
    isReconActive,
    reconCost,
    canAffordRecon,
    isExecutingRecon,
    currentStance,
    isWarStance,
    reputationPenalty,
    originRegionName,
    targetRegionName,
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
    handleExecuteQuickRecon,
    handleAutoOptimizeDeploy,
    handleExecuteAttack,
  };
}
