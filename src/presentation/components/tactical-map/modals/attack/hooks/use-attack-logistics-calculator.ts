import { useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { NavalNeighborResolver } from "@/domain/map/naval-neighbor-resolver";

interface UseAttackLogisticsCalculatorProps {
  humanNation: Nation | null;
  targetProvinceId: number | null;
  gameState: GameState | null;
  infantryToDeploy: number;
  armorToDeploy: number;
  airForceToDeploy: number;
  dronesToLaunch: number;
}

export function useAttackLogisticsCalculator({
  humanNation,
  targetProvinceId,
  gameState,
  infantryToDeploy,
  armorToDeploy,
  airForceToDeploy,
  dronesToLaunch,
}: UseAttackLogisticsCalculatorProps) {
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

  return {
    isLandNeighbor,
    navalAttackInfo,
    baseDeploymentCost,
    navalTransportExtraCost,
    isNavalOperation,
    totalLogisticsCost,
    canAfford,
    hasSelectedInfantry,
  };
}
