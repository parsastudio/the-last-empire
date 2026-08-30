import { useState, useEffect, useCallback, useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";

interface UseAttackForcesDeploymentProps {
  humanNation: Nation | null;
  isOpen: boolean;
  targetNationId: string | null;
  targetProvinceId?: number | null;
  attackType?: "LAND" | "NAVAL";
}

export function useAttackForcesDeployment({
  humanNation,
  isOpen,
  targetNationId,
  targetProvinceId,
  attackType = "LAND",
}: UseAttackForcesDeploymentProps) {
  const [infantryToDeploy, setInfantryToDeploy] = useState<number>(1);
  const [armorToDeploy, setArmorToDeploy] = useState<number>(0);
  const [airForceToDeploy, setAirForceToDeploy] = useState<number>(0);
  const [dronesToLaunch, setDronesToLaunch] = useState<number>(0);

  useEffect(() => {
    if (isOpen && humanNation) {
      const availInf = humanNation.military.infantry || 0;
      const availArm = humanNation.military.armor || 0;
      const availAir = humanNation.military.airForce || 0;
      const availDrone = humanNation.military.droneMissile || 0;

      setInfantryToDeploy(
        Math.max(1, Math.min(availInf, Math.ceil(availInf * 0.75))),
      );
      setArmorToDeploy(Math.min(availArm, Math.ceil(availArm * 0.75)));
      setAirForceToDeploy(Math.min(availAir, Math.ceil(availAir * 0.75)));
      setDronesToLaunch(Math.min(availDrone, Math.ceil(availDrone * 0.75)));
    }
  }, [isOpen, targetNationId, targetProvinceId, humanNation]);

  const navalFleetCount = humanNation?.navalFleet || 0;

  const hasNavalCapacity = useMemo(() => {
    if (attackType !== "NAVAL") return true;
    const maxCapacity = NavalDeploymentClamper.calculateMaxCapacity(
      "NAVAL",
      navalFleetCount,
    );
    const reqCapacity = NavalDeploymentClamper.calculateRequiredCapacity(
      infantryToDeploy,
      armorToDeploy,
    );
    return navalFleetCount > 0 && reqCapacity <= maxCapacity;
  }, [attackType, navalFleetCount, infantryToDeploy, armorToDeploy]);

  const totalForceCost = useMemo(() => {
    return (
      infantryToDeploy * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      armorToDeploy * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      airForceToDeploy * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost +
      dronesToLaunch * MILITARY_UNIT_STATS.DRONE_MISSILE.moneyCost
    );
  }, [infantryToDeploy, armorToDeploy, airForceToDeploy, dronesToLaunch]);

  const totalLogisticsCost = useMemo(() => {
    const { moneyCost } =
      CombatModifierResolver.calculateDeploymentCosts(totalForceCost);
    return moneyCost;
  }, [totalForceCost]);

  const currentTreasury = humanNation?.treasury || 0;
  const canAfford = currentTreasury >= totalLogisticsCost;
  const hasSelectedInfantry = infantryToDeploy > 0;

  const applyOptimizedDeploy = useCallback(
    (drones: number, airForce: number, armor: number, infantry: number) => {
      setDronesToLaunch(drones);
      setAirForceToDeploy(airForce);
      setArmorToDeploy(armor);
      setInfantryToDeploy(infantry);
    },
    [],
  );

  return {
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
    navalFleetCount,
    hasNavalCapacity,
    applyOptimizedDeploy,
  };
}
