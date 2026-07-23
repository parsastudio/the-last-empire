import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { DiplomaticOpinionCalculator } from "@/modules/diplomacy/domain/diplomatic-opinion-calculator";
import { GlobalIntelligenceUpdater } from "@/modules/diplomacy/domain/global-intelligence-updater";
import { PowerScoreCalculator } from "@/modules/diplomacy/domain/power-score-calculator";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class DiplomacyPhase implements TurnPhase {
  private opinionCalculator = new DiplomaticOpinionCalculator();
  private intelligenceUpdater = new GlobalIntelligenceUpdater();
  private powerCalculator = new PowerScoreCalculator();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    const rawNationsList = Object.values(nations)
      .filter((n) => n.isAlive)
      .map((n) => ({
        id: n.id,
        gdp: n.gdp,
        treasury: n.treasury,
        infantry: n.military.infantry,
        airForce: n.military.airForce,
        drone: n.military.droneMissile,
      }));

    this.powerCalculator.rankNations(rawNationsList);

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const updated = this.intelligenceUpdater.updatePassiveIntel(
        nation,
        nations,
      );
      const updatedRelations = { ...updated.relations };

      for (const [targetId, relation] of Object.entries(updatedRelations)) {
        const target = nations[targetId];
        if (target && target.isAlive) {
          const isLandNeighbor =
            updated.geography.landNeighbors.includes(targetId);
          const nextOpinion = this.opinionCalculator.calculateOpinion(
            updated.globalReputation,
            updated.globalAggression,
            relation.stance,
            isLandNeighbor,
          );

          updatedRelations[targetId] = {
            ...relation,
            opinion: nextOpinion,
          };
        }
      }

      updated.relations = updatedRelations;
      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
