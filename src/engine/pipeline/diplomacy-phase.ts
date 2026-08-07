import type { GameState } from "@/domain/game/game-state.schema";
import {
  PowerScoreRanker,
  ReputationManager,
  DiplomaticOpinionCalculator,
  RelationsManager,
} from "@/engine/diplomacy/diplomacy-engine";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { CountryRegistry } from "@/domain/data/countries";

export class DiplomacyPhase implements TurnPhase {
  private powerRanker = new PowerScoreRanker();
  private reputationManager = new ReputationManager();
  private opinionCalculator = new DiplomaticOpinionCalculator();
  private relationsManager = new RelationsManager();

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    const rawNationsList = Object.values(nations)
      .filter((n) => n.isAlive)
      .map((n) => {
        const govTraits = GovernmentSystem.getTraits(n.government.type);
        return {
          id: n.id,
          gdp: n.gdp,
          treasury: n.treasury,
          infantry: n.military.infantry,
          airForce: n.military.airForce,
          drone: n.military.droneMissile,
          techLevel: n.military.techLevel,
          militaryPowerMultiplier: govTraits.militaryPowerMultiplier,
        };
      });

    const ranked = this.powerRanker.rankNations(rawNationsList);

    for (const r of ranked) {
      if (nations[r.id]) {
        nations[r.id] = {
          ...nations[r.id],
          rank: r.rank,
        };
      }
    }

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = { ...nation };

      updated = this.reputationManager.applyReputationGain(updated, 2);

      const updatedRelations = { ...(updated.relations || {}) };

      for (const [targetId, relation] of Object.entries(updatedRelations)) {
        if (!relation) continue;
        const canonicalTargetId = CountryRegistry.resolveCanonicalId(targetId);
        const target = nations[targetId] || nations[canonicalTargetId];

        if (target && target.isAlive) {
          const landNeighbors = updated.geography?.landNeighbors || [];
          const isLandNeighbor =
            landNeighbors.includes(targetId) ||
            landNeighbors.includes(canonicalTargetId);

          const frictionValue =
            this.relationsManager.calculateGovernmentFriction(updated, target);

          const nextOpinion = this.opinionCalculator.calculateOpinion(
            relation.opinion,
            updated.globalReputation,
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
    return nextState;
  }
}
