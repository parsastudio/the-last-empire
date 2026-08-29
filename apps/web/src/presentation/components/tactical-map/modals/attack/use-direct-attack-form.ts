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
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { useUiStore } from "@/presentation/stores/use-ui-store";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { AttackDeploymentOptimizer } from "@/engine/combat/attack-deployment-optimizer";
import { EspionageCalculator } from "@/engine/espionage/espionage-calculator";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@geopolitics/domain";
import { TacticalForecast } from "./attack-intel-panel";

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
  const setSelectedBattleDebrief = useUiStore(
    (state) => state.setSelectedBattleDebrief,
  );

  const [infantryToDeploy, setInfantryToDeploy] = useState<number>(0);
  const [armorToDeploy, setArmorToDeploy] = useState<number>(0);
  const [airForceToDeploy, setAirForceToDeploy] = useState<number>(0);
  const [dronesToLaunch, setDronesToLaunch] = useState<number>(0);
  const [isExecutingRecon, setIsExecutingRecon] = useState<boolean>(false);

  const [prevKey, setPrevKey] = useState<string | null>(null);
  const currentKey = `${humanNation?.id}-${isOpen}-${targetNationId}-${targetProvinceId}`;

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setInfantryToDeploy(humanNation ? humanNation.military.infantry : 0);
    setArmorToDeploy(humanNation ? humanNation.military.armor || 0 : 0);
    setAirForceToDeploy(humanNation ? humanNation.military.airForce : 0);
    setDronesToLaunch(0);
  }

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

  const navalFleetCount = humanNation?.navalFleet || 0;
  const maxNavalCapacity = navalFleetCount * 60;
  const requiredNavalLoad = infantryToDeploy * 1 + armorToDeploy * 4;
  const hasNavalCapacity =
    attackType !== "NAVAL" ||
    (navalFleetCount > 0 && requiredNavalLoad <= maxNavalCapacity);

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

  const rawForceValue = useMemo(() => {
    return (
      infantryToDeploy * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      armorToDeploy * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      airForceToDeploy * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      dronesToLaunch * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost
    );
  }, [infantryToDeploy, armorToDeploy, airForceToDeploy, dronesToLaunch]);

  const totalLogisticsCost = Math.floor(rawForceValue * 0.05);
  const canAfford = (humanNation?.treasury || 0) >= totalLogisticsCost;
  const hasSelectedInfantry = infantryToDeploy > 0;

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

  const forecast = useMemo<TacticalForecast>(() => {
    if (!humanNation || !targetNation) {
      return {
        winProbability: 0,
        isVictoryPredicted: false,
        isCapitulationPredicted: false,
        phase1Prediction: "نامشخص",
        phase2Prediction: "نامشخص",
        phase3Prediction: "نامشخص",
        valuationRatio: 1,
      };
    }

    const calc = BattleCalculator.calculateBattle(
      humanNation,
      targetNation,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      gameState?.provinces,
      targetGuarantorNation,
    );

    let winProb = 50;
    if (calc.isAttackerVictory) {
      winProb = Math.min(99, Math.round(55 + (calc.valuationRatio - 1.0) * 35));
    } else {
      winProb = Math.max(1, Math.round(45 * calc.valuationRatio));
    }

    return {
      winProbability: winProb,
      isVictoryPredicted: calc.isAttackerVictory,
      isCapitulationPredicted: calc.isFullCapitulation,
      phase1Prediction: calc.phase1Missile.phaseWinner,
      phase2Prediction: calc.phase2Air.phaseWinner,
      phase3Prediction: calc.phase3Ground.phaseWinner,
      valuationRatio: calc.valuationRatio,
      auxiliaryGuarantor: calc.auxiliaryGuarantor,
    };
  }, [
    humanNation,
    targetNation,
    targetGuarantorNation,
    dronesToLaunch,
    infantryToDeploy,
    armorToDeploy,
    airForceToDeploy,
    gameState?.provinces,
  ]);

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
      navalFleetCount,
    );

    setDronesToLaunch(result.drones);
    setAirForceToDeploy(result.airForce);
    setArmorToDeploy(result.armor);
    setInfantryToDeploy(result.infantry);
  }, [
    humanNation,
    targetNation,
    gameState?.provinces,
    targetGuarantorNation,
    attackType,
    navalFleetCount,
  ]);

  const handleExecuteAttack = useCallback(async () => {
    if (!humanNation || !targetNation || isSubmitting || !hasNavalCapacity) {
      return;
    }

    const action = ActionFactory.initiateBattle(
      humanNation.id,
      targetNation.id,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
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
        setSelectedBattleDebrief(report);

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
    hasNavalCapacity,
    dronesToLaunch,
    infantryToDeploy,
    armorToDeploy,
    airForceToDeploy,
    targetProvinceId,
    attackType,
    dispatchAction,
    targetRegionName,
    onClose,
    setSelectedBattleDebrief,
  ]);

  return {
    targetNation,
    targetGuarantorNation,
    targetProvince,
    isLandNeighbor,
    isNavalValid,
    attackType,
    navalFleetCount,
    hasNavalCapacity,
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
    infantryToDeploy,
    setInfantryToDeploy,
    armorToDeploy,
    setArmorToDeploy,
    airForceToDeploy,
    setAirForceToDeploy,
    dronesToLaunch,
    setDronesToLaunch,
    totalLogisticsCost,
    canAfford,
    hasSelectedInfantry,
    isSubmitting,
    handleExecuteQuickRecon,
    handleAutoOptimizeDeploy,
    handleExecuteAttack,
  };
}
