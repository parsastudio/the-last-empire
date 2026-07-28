import type { GameAction } from "@/domain/game/action.schema";
import { AIPlanner } from "@/engine/ai/planners/ai-planner";
import { AIPlanningContext } from "@/engine/ai/planners/ai-planning-context";
import { DeterministicIdGenerator } from "../utils/deterministic-id-generator";

export class TradePlanningStep implements AIPlanner {
  private idGenerator = new DeterministicIdGenerator();

  public plan(context: AIPlanningContext): GameAction[] {
    const actions: GameAction[] = [];
    const nation = context.nation;
    const turn = context.currentTurn ?? 1;
    let seq = 1;

    const currentOilPrice = context.allNations[nation.id]?.relations
      ? 100
      : 100;

    const requiredOilPerTurn = Math.ceil(
      (nation.military.airForce + nation.military.droneMissile) * 0.5,
    );

    if (
      requiredOilPerTurn > 0 &&
      nation.resources.oil < requiredOilPerTurn * 3 &&
      currentOilPrice < 250
    ) {
      const buyAmount = Math.max(
        10,
        requiredOilPerTurn * 5 - nation.resources.oil,
      );
      if (nation.treasury > buyAmount * 200) {
        actions.push({
          id: this.idGenerator.generateActionId(
            "TRADE_RESOURCES",
            nation.id,
            turn,
            seq++,
          ),
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
          id: this.idGenerator.generateActionId(
            "TRADE_RESOURCES",
            nation.id,
            turn,
            seq++,
          ),
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
          id: this.idGenerator.generateActionId(
            "TRADE_RESOURCES",
            nation.id,
            turn,
            seq++,
          ),
          nationId: nation.id,
          type: "TRADE_RESOURCES",
          resourceType: "oil",
          isBuy: false,
          amount: 20,
        });
      } else if (nation.resources.steel > 100) {
        actions.push({
          id: this.idGenerator.generateActionId(
            "TRADE_RESOURCES",
            nation.id,
            turn,
            seq++,
          ),
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
