import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { ActionFactory } from "@/domain/game/action-factory";
import { CountryRegistry } from "@/domain/data/countries";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { useAttackFormState } from "@/presentation/components/tactical-map/modals/attack/hooks/use-attack-form-state";
import { useAttackLogisticsCalculator } from "@/presentation/components/tactical-map/modals/attack/hooks/use-attack-logistics-calculator";

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const formState = useAttackFormState({
    humanNation,
    targetNationId,
    targetProvinceId,
    isOpen,
  });

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

  const logistics = useAttackLogisticsCalculator({
    humanNation,
    targetProvinceId,
    gameState,
    infantryToDeploy: formState.infantryToDeploy,
    armorToDeploy: formState.armorToDeploy,
    airForceToDeploy: formState.airForceToDeploy,
    dronesToLaunch: formState.dronesToLaunch,
  });

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

    try {
      setIsSubmitting(true);
      const action = ActionFactory.initiateBattle(
        humanNation.id,
        targetNation.id,
        formState.dronesToLaunch,
        formState.infantryToDeploy,
        formState.armorToDeploy,
        formState.airForceToDeploy,
        targetProvinceId || undefined,
        logistics.isLandNeighbor ? "LAND" : "NAVAL",
      );

      const typeLabel = logistics.isLandNeighbor ? "زمینی" : "دریایی";
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
    formState.dronesToLaunch,
    formState.infantryToDeploy,
    formState.armorToDeploy,
    formState.airForceToDeploy,
    targetProvinceId,
    logistics.isLandNeighbor,
    dispatchAction,
    targetRegionName,
    onClose,
  ]);

  return {
    targetNation,
    targetProvince,
    isLandNeighbor: logistics.isLandNeighbor,
    navalAttackInfo: logistics.navalAttackInfo,
    isWarStance,
    targetRegionName,
    infantryToDeploy: formState.infantryToDeploy,
    setInfantryToDeploy: formState.setInfantryToDeploy,
    armorToDeploy: formState.armorToDeploy,
    setArmorToDeploy: formState.setArmorToDeploy,
    airForceToDeploy: formState.airForceToDeploy,
    setAirForceToDeploy: formState.setAirForceToDeploy,
    dronesToLaunch: formState.dronesToLaunch,
    setDronesToLaunch: formState.setDronesToLaunch,
    baseDeploymentCost: logistics.baseDeploymentCost,
    navalTransportExtraCost: logistics.navalTransportExtraCost,
    isNavalOperation: logistics.isNavalOperation,
    totalLogisticsCost: logistics.totalLogisticsCost,
    canAfford: logistics.canAfford,
    hasSelectedInfantry: logistics.hasSelectedInfantry,
    isSubmitting,
    handleExecuteAttack,
  };
}
