import { useState, useMemo } from "react";
import { MilitaryStack } from "@/domain/military/military.schema";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { useBattleValidation } from "@/presentation/hooks/game/use-battle-validation";
import { AttackForceEstimator } from "../attack/attack-force-estimator";
import { ActionFactory } from "@/domain/game/action-factory";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

interface UseAttackPlanningProps {
  isOpen: boolean;
  attackerCode: string;
  targetName: string;
  targetCode: string;
  coordinate: { x: number; y: number };
  stance: string;
  userOilStock: number;
  userTreasury: number;
  availableMilitary?: MilitaryStack;
  onConfirmAttack: () => void;
}

export function useAttackPlanning({
  isOpen,
  attackerCode,
  targetName,
  targetCode,
  coordinate,
  stance,
  userOilStock,
  userTreasury,
  availableMilitary = {
    infantry: 50,
    airForce: 10,
    droneMissile: 5,
    experience: 10,
    techLevel: 1,
  },
  onConfirmAttack,
}: UseAttackPlanningProps) {
  const maxInfantry = Math.max(0, availableMilitary.infantry);
  const maxAirForce = Math.max(0, availableMilitary.airForce);
  const maxDroneMissile = Math.max(0, availableMilitary.droneMissile);

  const [infantry, setInfantry] = useState<number>(
    Math.min(50, Math.max(1, maxInfantry)),
  );
  const [airForce, setAirForce] = useState<number>(
    Math.min(10, Math.max(0, maxAirForce)),
  );
  const [droneMissile, setDroneMissile] = useState<number>(
    Math.min(5, Math.max(0, maxDroneMissile)),
  );

  const [prevCoordinate, setPrevCoordinate] = useState<{
    x: number;
    y: number;
  } | null>(null);

  if (coordinate !== prevCoordinate) {
    setPrevCoordinate(coordinate);
    setInfantry(Math.min(50, Math.max(1, maxInfantry)));
    setAirForce(Math.min(10, Math.max(0, maxAirForce)));
    setDroneMissile(Math.min(5, Math.max(0, maxDroneMissile)));
  }

  const { dispatchAction } = useGameActions();
  const estimator = useMemo(() => new AttackForceEstimator(), []);

  const fullAttackerId = NationIdResolver.resolveCanonicalId(attackerCode);

  const { validationResult, loading: isValidationLoading } =
    useBattleValidation(fullAttackerId, coordinate, isOpen);

  const distScore = validationResult?.distance ?? 50;

  const logistics = estimator.calculateLogisticsCost({
    infantry,
    airForce,
    droneMissile,
    distanceMultiplier: validationResult?.surchargeMultiplier ?? 1.0,
    distanceScore: distScore,
  });

  const finalCost = validationResult?.logisticsCost
    ? validationResult.logisticsCost + logistics.estimatedMoneyCost
    : logistics.estimatedMoneyCost;

  const isAtWar = stance === "WAR";
  const isOilDeficit = userOilStock < logistics.requiredOil;
  const isBudgetDeficit = userTreasury < finalCost;
  const emergencyDebt = isBudgetDeficit
    ? finalCost - Math.max(0, userTreasury)
    : 0;

  const isServerInvalid =
    validationResult !== null && validationResult.isValid === false;

  const totalForceSelected = infantry + airForce + droneMissile;

  const handleConfirm = async () => {
    if (totalForceSelected <= 0 || isBudgetDeficit) return;

    const fullTargetId = NationIdResolver.resolveCanonicalId(targetCode);

    const attackAction = ActionFactory.attack(
      fullAttackerId,
      fullTargetId,
      infantry,
      airForce,
      droneMissile,
      coordinate,
    );

    const success = await dispatchAction(
      attackAction,
      `فرمان حمله به نیروهای ${targetName} صادر گردید.`,
    );

    if (success) {
      onConfirmAttack();
    }
  };

  return {
    infantry,
    airForce,
    droneMissile,
    maxInfantry,
    maxAirForce,
    maxDroneMissile,
    logistics,
    finalCost,
    isAtWar,
    isOilDeficit,
    isBudgetDeficit,
    emergencyDebt,
    isServerInvalid,
    isValidationLoading,
    validationResult,
    totalForceSelected,
    setInfantry,
    setAirForce,
    setDroneMissile,
    handleConfirm,
  };
}
