import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { CountryRegistry } from "@/domain/data/countries";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";

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
  const currentKey = `${humanNation?.id}-${isOpen}-${targetNationId}-${targetProvinceId}`;
  const [prevKey, setPrevKey] = useState<string | null>(null);

  const [infantryToDeploy, setInfantryToDeploy] = useState<number>(0);
  const [armorToDeploy, setArmorToDeploy] = useState<number>(0);
  const [airForceToDeploy, setAirForceToDeploy] = useState<number>(0);
  const [dronesToLaunch, setDronesToLaunch] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { dispatchAction } = useGameActions();

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

  const isWarStance = useMemo(() => {
    if (!humanNation || !targetNation) return false;
    return NationRelationResolver.isWar(humanNation.relations, targetNation.id);
  }, [humanNation, targetNation]);

  const targetRegionName = useMemo(() => {
    if (targetProvince) return targetProvince.nameFa;
    if (!targetNation) return "";
    return `خاک اصلی ${targetNation.name}`;
  }, [targetNation, targetProvince]);

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

  const navalTransportExtraCost = useMemo(() => {
    if (!isNavalOperation) return 0;
    return Math.max(
      0,
      navalAttackInfo.deploymentMoneyCost - baseDeploymentCost,
    );
  }, [
    isNavalOperation,
    navalAttackInfo.deploymentMoneyCost,
    baseDeploymentCost,
  ]);

  const totalLogisticsCost = useMemo(() => {
    if (isLandNeighbor) {
      return baseDeploymentCost;
    }
    if (navalAttackInfo.isNavalValid) {
      return navalAttackInfo.deploymentMoneyCost;
    }
    return 0;
  }, [isLandNeighbor, baseDeploymentCost, navalAttackInfo]);

  const canAfford = (humanNation?.treasury || 0) >= totalLogisticsCost;
  const hasSelectedInfantry = infantryToDeploy > 0;

  const handleExecuteAttack = useCallback(async () => {
    if (!humanNation || !targetNation || isSubmitting) return;

    try {
      setIsSubmitting(true);
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
      const success = await dispatchAction(
        action,
        `دستور تهاجم ${typeLabel} به ${targetRegionName} با موفقیت صادر گردید.`,
      );

      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
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
