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
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { useUiStore } from "@/presentation/stores/use-ui-store";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";

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

  const navalAttackInfo = useMemo(() => {
    if (isLandNeighbor || !humanNation || !targetProvinceId) {
      return {
        isNavalValid: false,
        closestDistance: 0,
        closestProvinceName: "",
        navalCostMultiplier: 0,
        deploymentMoneyCost: 0,
      };
    }

    return NavalNeighborResolver.resolveNavalAttack(
      targetProvinceId,
      humanNation.id,
      gameState?.provinces,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      dronesToLaunch,
    );
  }, [
    isLandNeighbor,
    humanNation,
    targetProvinceId,
    gameState?.provinces,
    infantryToDeploy,
    armorToDeploy,
    airForceToDeploy,
    dronesToLaunch,
  ]);

  const rawForceValue = useMemo(() => {
    return (
      infantryToDeploy * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      armorToDeploy * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      airForceToDeploy * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      dronesToLaunch * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost
    );
  }, [infantryToDeploy, armorToDeploy, airForceToDeploy, dronesToLaunch]);

  const baseDeploymentCost = Math.floor(rawForceValue * 0.05);
  const isNavalOperation = !isLandNeighbor && navalAttackInfo.isNavalValid;

  const navalTransportExtraCost = isNavalOperation
    ? Math.max(0, navalAttackInfo.deploymentMoneyCost - baseDeploymentCost)
    : 0;

  const totalLogisticsCost = isLandNeighbor
    ? baseDeploymentCost
    : navalAttackInfo.isNavalValid
      ? navalAttackInfo.deploymentMoneyCost
      : 0;

  const canAfford = (humanNation?.treasury || 0) >= totalLogisticsCost;
  const hasSelectedInfantry = infantryToDeploy > 0;

  const isWarStance = useMemo(() => {
    if (!humanNation || !targetNation) return false;
    return NationRelationResolver.isWar(humanNation.relations, targetNation.id);
  }, [humanNation, targetNation]);

  const targetRegionName = useMemo(() => {
    if (targetProvince) return targetProvince.nameFa;
    if (!targetNation) return "";
    return `خاک اصلی ${targetNation.name}`;
  }, [targetNation, targetProvince]);

  const handleExecuteAttack = useCallback(async () => {
    if (!humanNation || !targetNation || isSubmitting) return;

    const action = ActionFactory.initiateBattle(
      humanNation.id,
      targetNation.id,
      dronesToLaunch,
      infantryToDeploy,
      armorToDeploy,
      airForceToDeploy,
      targetProvinceId || undefined,
      isLandNeighbor ? "LAND" : "NAVAL",
    );

    const typeLabel = isLandNeighbor ? "زمینی" : "دریایی";
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
    dronesToLaunch,
    infantryToDeploy,
    armorToDeploy,
    airForceToDeploy,
    targetProvinceId,
    isLandNeighbor,
    dispatchAction,
    targetRegionName,
    onClose,
    setSelectedBattleDebrief,
  ]);

  return {
    targetNation,
    targetProvince,
    isLandNeighbor,
    navalAttackInfo,
    isWarStance,
    targetRegionName,
    infantryToDeploy,
    setInfantryToDeploy,
    armorToDeploy,
    setArmorToDeploy,
    airForceToDeploy,
    setAirForceToDeploy,
    dronesToLaunch,
    setDronesToLaunch,
    baseDeploymentCost,
    navalTransportExtraCost,
    isNavalOperation,
    totalLogisticsCost,
    canAfford,
    hasSelectedInfantry,
    isSubmitting,
    handleExecuteAttack,
  };
}
