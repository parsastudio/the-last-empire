import type { GameState } from "@/domain/game/game-state.schema";
import { DiplomaticOpinionCalculator } from "@/engine/diplomacy/diplomatic-opinion-calculator";
import { GlobalIntelligenceUpdater } from "@/engine/diplomacy/global-intelligence-updater";
import { PowerScoreCalculator } from "@/engine/diplomacy/power-score-calculator";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { RelationsManager } from "@/engine/diplomacy/relations-manager";
import { CoalitionManager } from "@/engine/diplomacy/coalition-manager";
import { ReputationManager } from "@/engine/diplomacy/reputation-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export class DiplomacyPhase implements TurnPhase {
  private opinionCalculator = new DiplomaticOpinionCalculator();
  private intelligenceUpdater = new GlobalIntelligenceUpdater();
  private powerCalculator = new PowerScoreCalculator();
  private governmentSystem = new GovernmentSystem();
  private relationsManager = new RelationsManager();
  private coalitionManager = new CoalitionManager();
  private reputationManager = new ReputationManager();

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

      let updated = this.intelligenceUpdater.updatePassiveIntel(
        nation,
        nations,
      );

      if (updated.globalReputation < 0) {
        updated = this.reputationManager.applyReputationGain(updated, 2);
      } else if (updated.globalReputation > 0) {
        updated = {
          ...updated,
          globalReputation: Math.max(0, updated.globalReputation - 1),
        };
      }

      const updatedRelations = { ...updated.relations };

      for (const [targetId, relation] of Object.entries(updatedRelations)) {
        const target = nations[targetId];
        if (target && target.isAlive) {
          if (relation.tributePerTurn > 0) {
            const receiverPower =
              target.military.infantry * 1.0 +
              target.military.airForce * 3.0 +
              target.military.droneMissile * 2.5;
            const payerPower =
              updated.military.infantry * 1.0 +
              updated.military.airForce * 3.0 +
              updated.military.droneMissile * 2.5;

            if (payerPower >= receiverPower * 0.5) {
              updatedRelations[targetId] = {
                ...relation,
                tributePerTurn: 0,
                opinion: Math.max(-100, relation.opinion - 40),
                stance: "PEACE",
              };
              continue;
            }
          }

          const isLandNeighbor =
            updated.geography.landNeighbors.includes(targetId);

          const frictionValue =
            this.relationsManager.calculateGovernmentFriction(updated, target);

          const nextOpinion = this.opinionCalculator.calculateOpinion(
            relation.opinion,
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
