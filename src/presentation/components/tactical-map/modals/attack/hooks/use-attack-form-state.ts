import { useState } from "react";
import { Nation } from "@/domain/nation/nation.schema";

interface UseAttackFormStateProps {
  humanNation: Nation | null;
  targetNationId: string | null;
  targetProvinceId: number | null;
  isOpen: boolean;
}

export function useAttackFormState({
  humanNation,
  targetNationId,
  targetProvinceId,
  isOpen,
}: UseAttackFormStateProps) {
  const currentKey = `${humanNation?.id}-${isOpen}-${targetNationId}-${targetProvinceId}`;
  const [prevKey, setPrevKey] = useState<string | null>(null);

  const [infantryToDeploy, setInfantryToDeploy] = useState<number>(0);
  const [armorToDeploy, setArmorToDeploy] = useState<number>(0);
  const [airForceToDeploy, setAirForceToDeploy] = useState<number>(0);
  const [dronesToLaunch, setDronesToLaunch] = useState<number>(0);

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    setInfantryToDeploy(humanNation ? humanNation.military.infantry : 0);
    setArmorToDeploy(humanNation ? humanNation.military.armor || 0 : 0);
    setAirForceToDeploy(humanNation ? humanNation.military.airForce : 0);
    setDronesToLaunch(0);
  }

  return {
    infantryToDeploy,
    setInfantryToDeploy,
    armorToDeploy,
    setArmorToDeploy,
    airForceToDeploy,
    setAirForceToDeploy,
    dronesToLaunch,
    setDronesToLaunch,
  };
}
