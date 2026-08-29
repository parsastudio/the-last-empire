import { useState, useMemo, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

interface UseAttackForcesDeploymentProps {
  humanNation: Nation | null;
  isOpen: boolean;
  targetNationId: string | null;
  targetProvinceId: number | null;
  attackType: "LAND" | "NAVAL";
}

export function useAttackForcesDeployment({
  humanNation,
  isOpen,
  targetNationId,
  targetProvinceId,
  attackType,
}: UseAttackForcesDeploymentProps) {
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

  const navalFleetCount = humanNation?.navalFleet || 0;
  const maxNavalCapacity = navalFleetCount * 60;
  const requiredNavalLoad = infantryToDeploy * 1 + armorToDeploy * 4;
  const hasNavalCapacity =
    attackType !== "NAVAL" ||
    (navalFleetCount > 0 && requiredNavalLoad <= maxNavalCapacity);

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
