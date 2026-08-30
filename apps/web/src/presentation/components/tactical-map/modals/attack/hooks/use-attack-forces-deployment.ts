"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { CombatModifierResolver } from "@/engine/combat/combat-modifier-resolver";
import { NavalDeploymentClamper } from "@/engine/combat/optimizer/naval-deployment-clamper";

interface UseAttackForcesDeploymentProps {
  humanNation: Nation | null;
  isOpen: boolean;
  targetNationId: string | null;
  targetProvinceId: number | null;
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

  useEffect(() => {
    if (isOpen && humanNation) {
      const defaultInf = Math.max(
        1,
        Math.min(
          humanNation.military.infantry,
          Math.ceil(humanNation.military.infantry * 0.7),
        ),
      );
      const defaultArm = Math.min(
        humanNation.military.armor || 0,
        Math.ceil((humanNation.military.armor || 0) * 0.7),
      );
      const defaultAir = Math.min(
        humanNation.military.airForce,
        Math.ceil(humanNation.military.airForce * 0.7),
      );

      setInfantryToDeploy(defaultInf);
      setArmorToDeploy(defaultArm);
      setAirForceToDeploy(defaultAir);
    }
  }, [isOpen, targetNationId, targetProvinceId, humanNation]);

  const navalFleetCount = humanNation?.navalFleet || 0;

  const hasNavalCapacity = useMemo(() => {
    if (attackType !== "NAVAL") return true;
    const maxCapacity = NavalDeploymentClamper.calculateMaxCapacity(
      "NAVAL",
      navalFleetCount,
    );
    const required = NavalDeploymentClamper.calculateRequiredCapacity(
      infantryToDeploy,
      armorToDeploy,
    );
    return maxCapacity >= required && navalFleetCount > 0;
  }, [attackType, navalFleetCount, infantryToDeploy, armorToDeploy]);

  const totalForceCost = useMemo(() => {
    return (
      infantryToDeploy * MILITARY_UNIT_STATS.INFANTRY.moneyCost +
      armorToDeploy * MILITARY_UNIT_STATS.ARMOR.moneyCost +
      airForceToDeploy * MILITARY_UNIT_STATS.AIR_FORCE.moneyCost
    );
  }, [infantryToDeploy, armorToDeploy, airForceToDeploy]);

  const { moneyCost: totalLogisticsCost } = useMemo(() => {
    return CombatModifierResolver.calculateDeploymentCosts(totalForceCost);
  }, [totalForceCost]);

  const canAfford = (humanNation?.treasury || 0) >= totalLogisticsCost;
  const hasSelectedInfantry = infantryToDeploy > 0;

  const applyOptimizedDeploy = useCallback(
    (airForce: number, armor: number, infantry: number) => {
      setAirForceToDeploy(airForce);
      setArmorToDeploy(armor);
      setInfantryToDeploy(Math.max(1, infantry));
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
    navalFleetCount,
    hasNavalCapacity,
    totalLogisticsCost,
    canAfford,
    hasSelectedInfantry,
    applyOptimizedDeploy,
  };
}
