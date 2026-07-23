import { useCallback, useMemo } from "react";
import type { GameAction } from "@/domain/game/action.schema";
import type { Nation } from "@/domain/nation/nation.schema";
import type { UnitType } from "@/domain/military/military.schema";
import { UnitCostCalculator } from "@/engine/military/unit-cost-calculator";
import { ResearchDevelopmentManager } from "@/engine/military/research-development-manager";

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

  const investResearch = useCallback(() => {
    if (!nation) {
      return;
    }
    dispatch({
      id: `research-${Date.now()}`,
      nationId: nation.id,
      type: "INVEST_RESEARCH",
    });
  }, [nation, dispatch]);

  const disbandUnit = useCallback(
    (unitType: UnitType, quantity: number) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `disband-${Date.now()}`,
        nationId: nation.id,
        type: "DISBAND_UNIT",
        unitType,
        quantity,
      });
    },
    [nation, dispatch],
  );

  const cancelRecruitment = useCallback(
    (orderId: string) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `cancel-${Date.now()}`,
        nationId: nation.id,
        type: "CANCEL_RECRUITMENT",
        orderId,
      });
    },
    [nation, dispatch],
  );

  return {
    getUnitCostDetails,
    recruitUnit,
    getResearchUpgradeCost,
    investResearch,
    disbandUnit,
    cancelRecruitment,
  };
}
