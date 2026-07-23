import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { AIPlanner } from "./ai-planner";
import { AIPlanningContext } from "./ai-planning-context";

export class TradePlanningStep implements AIPlanner {
  public plan(context: AIPlanningContext): GameAction[] {
    const actions: GameAction[] = [];
    const nation = context.nation;

    const requiredOilPerTurn = Math.ceil(
      (nation.military.airForce + nation.military.droneMissile) * 0.5,
    );

    if (
      requiredOilPerTurn > 0 &&
      nation.resources.oil < requiredOilPerTurn * 3
    ) {
      const buyAmount = Math.max(
        10,
        requiredOilPerTurn * 5 - nation.resources.oil,
      );
      if (nation.treasury > buyAmount * 200) {
        actions.push({
          id: `ai-trade-oil-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "TRADE_RESOURCES",
          resourceType: "oil",
          isBuy: true,
          amount: buyAmount,
        });
      }
    }

    const activeRecruitmentCount = nation.recruitmentQueue.filter(
      (q) => q.unitType === "AIR_FORCE" || q.unitType === "DRONE_MISSILE",
    ).length;

    if (activeRecruitmentCount > 0 && nation.resources.steel < 20) {
      const buyAmount = 25;
      if (nation.treasury > buyAmount * 250) {
        actions.push({
          id: `ai-trade-steel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "TRADE_RESOURCES",
          resourceType: "steel",
          isBuy: true,
          amount: buyAmount,
        });
      }
    }

    if (nation.treasury < 30000) {
      if (nation.resources.oil > 100) {
        actions.push({
          id: `ai-sell-oil-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "TRADE_RESOURCES",
          resourceType: "oil",
          isBuy: false,
          amount: 20,
        });
      } else if (nation.resources.steel > 100) {
        actions.push({
          id: `ai-sell-steel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nationId: nation.id,
          type: "TRADE_RESOURCES",
          resourceType: "steel",
          isBuy: false,
          amount: 20,
        });
      }
    }

    return actions;
  }
}
