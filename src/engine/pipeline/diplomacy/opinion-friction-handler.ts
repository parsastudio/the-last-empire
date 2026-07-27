import { Nation } from "@/domain/nation/nation.schema";
import { DiplomaticOpinionCalculator } from "@/engine/diplomacy/diplomatic-opinion-calculator";
import { RelationsManager } from "@/engine/diplomacy/relations-manager";

export class OpinionFrictionHandler {
  private opinionCalculator = new DiplomaticOpinionCalculator();
  private relationsManager = new RelationsManager();

  public handle(nation: Nation, nations: Record<string, Nation>): Nation {
    const updated = { ...nation };
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

        const frictionValue = this.relationsManager.calculateGovernmentFriction(
          updated,
          target,
        );

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
    return updated;
  }
}
