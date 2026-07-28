import type { GameAction } from "@/domain/game/action.schema";
import { AIRecruitmentPlanner } from "@/engine/ai/ai-recruitment-planner";
import { AIPlanner } from "@/engine/ai/planners/ai-planner";
import { AIPlanningContext } from "@/engine/ai/planners/ai-planning-context";
import { DeterministicIdGenerator } from "../utils/deterministic-id-generator";

export class MilitaryPlanningStep implements AIPlanner {
  private recruitmentPlanner = new AIRecruitmentPlanner();
  private idGenerator = new DeterministicIdGenerator();

  public plan(context: AIPlanningContext): GameAction[] {
    const actions: GameAction[] = [];
    const nation = context.nation;
    const needs = context.needs;
    const risk = context.risk;
    const allocation = context.budget;
    const turn = context.currentTurn ?? 1;
    let seq = 1;

    if (
      allocation.recruitmentBudget > 0 &&
      (needs.needMilitary > 0.4 || risk > 30)
    ) {
      actions.push(
        ...this.recruitmentPlanner.planRecruitment(
          nation,
          allocation.recruitmentBudget,
          turn,
        ),
      );
    }

    for (const [targetId, relation] of Object.entries(nation.relations)) {
      const target = context.allNations[targetId];
      if (target && target.isAlive && relation.stance === "WAR") {
        const ownPower =
          nation.military.infantry * 1.0 +
          nation.military.airForce * 3.0 +
          nation.military.droneMissile * 2.5;
        const enemyPower =
          target.military.infantry * 1.0 +
          target.military.airForce * 3.0 +
          target.military.droneMissile * 2.5;

        if (ownPower > enemyPower * 1.2 && ownPower > 20) {
          const infantryDeploy = Math.floor(nation.military.infantry * 0.6);
          const airForceDeploy = Math.floor(nation.military.airForce * 0.6);
          const droneDeploy = Math.floor(nation.military.droneMissile * 0.6);

          if (infantryDeploy > 0 || airForceDeploy > 0 || droneDeploy > 0) {
            actions.push({
              id: this.idGenerator.generateActionId(
                "ATTACK",
                nation.id,
                turn,
                seq++,
              ),
              nationId: nation.id,
              type: "ATTACK",
              targetNationId: targetId,
              infantry: infantryDeploy,
              airForce: airForceDeploy,
              droneMissile: droneDeploy,
            });
          }
        }
      }
    }

    return actions;
  }
}
