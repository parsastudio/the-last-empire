import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { DiplomaticOpinionCalculator } from "@/modules/diplomacy/domain/diplomatic-opinion-calculator";
import { GlobalIntelligenceUpdater } from "@/modules/diplomacy/domain/global-intelligence-updater";
import { PowerScoreCalculator } from "@/modules/diplomacy/domain/power-score-calculator";
import { GovernmentSystem } from "@/modules/politics/domain/government-system";
import { RelationsManager } from "@/modules/diplomacy/domain/relations-manager";
import { CoalitionManager } from "@/modules/diplomacy/domain/coalition-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class DiplomacyPhase implements TurnPhase {
  private opinionCalculator = new DiplomaticOpinionCalculator();
  private intelligenceUpdater = new GlobalIntelligenceUpdater();
  private powerCalculator = new PowerScoreCalculator();
  private governmentSystem = new GovernmentSystem();
  private relationsManager = new RelationsManager();
  private coalitionManager = new CoalitionManager();

  public execute(context: PipelineContext): GameState {
    let nextState = { ...context.state };
    const nations = { ...nextState.nations };

    const rawNationsList = Object.values(nations)
      .filter((n) => n.isAlive)
      .map((n) => {
        const govTraits = this.governmentSystem.getTraits(n.government.type);
        return {
          id: n.id,
          gdp: n.gdp,
          treasury: n.treasury,
          infantry: n.military.infantry,
          airForce: n.military.airForce,
          drone: n.military.droneMissile,
          militaryPowerMultiplier: govTraits.militaryPowerMultiplier,
        };
      });

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

          const frictionValue =
            this.relationsManager.calculateGovernmentFriction(updated, target);

          const nextOpinion = this.opinionCalculator.calculateOpinion(
            updated.globalReputation,
            updated.globalAggression,
            relation.stance,
            isLandNeighbor,
            frictionValue,
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
    nextState = this.coalitionManager.processCoalitions(nextState);

    return nextState;
  }
}
