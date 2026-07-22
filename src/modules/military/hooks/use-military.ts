import { useCallback, useMemo } from "react";
import type { GameAction, Nation, UnitType } from "@/core/types";
import { UnitCostCalculator } from "../domain/unit-cost-calculator";
import { ResearchDevelopmentManager } from "../domain/research-development-manager";

export function useMilitary(
  nation: Nation | undefined,
  dispatch: (action: GameAction) => void,
) {
  const costCalculator = useMemo(() => new UnitCostCalculator(), []);
  const researchManager = useMemo(() => new ResearchDevelopmentManager(), []);

  const getUnitCostDetails = useCallback(
    (unitType: UnitType, quantity: number) => {
      if (!nation) {
        return { moneyCost: 0, manpowerCost: 0, buildTurns: 0 };
      }
      return costCalculator.calculateTotalCost(
        unitType,
        quantity,
        nation.industrialLevel,
      );
    },
    [nation, costCalculator],
  );

  const recruitUnit = useCallback(
    (unitType: UnitType, quantity: number) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `recruit-${Date.now()}`,
        nationId: nation.id,
        type: "RECRUIT_UNIT",
        unitType,
        quantity,
      });
    },
    [nation, dispatch],
  );

  const getResearchUpgradeCost = useCallback((): number => {
    if (!nation) {
      return 0;
    }
    return researchManager.getResearchCost(nation.military.techLevel);
  }, [nation, researchManager]);

  return {
    getUnitCostDetails,
    recruitUnit,
    getResearchUpgradeCost,
  };
}
