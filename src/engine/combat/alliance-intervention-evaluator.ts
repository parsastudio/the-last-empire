import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";

export interface AllianceInterventionResult {
  interveningAllyIds: string[];
  dishonoringAllyIds: string[];
  updatedNations: Record<string, Nation>;
}

export class AllianceInterventionEvaluator {
  public static evaluateAllianceInterventions(
    attacker: Nation,
    defender: Nation,
    nationsMap: Record<string, Nation>,
  ): AllianceInterventionResult {
    const interveningAllyIds: string[] = [];
    const dishonoringAllyIds: string[] = [];
    const updatedNations: Record<string, Nation> = { ...nationsMap };

    const attackerPower =
      MilitaryPowerCalculator.calculateEffectivePower(attacker);

    for (const [targetId, relation] of Object.entries(
      defender.relations || {},
    )) {
      if (relation.stance !== "ALLIANCE") continue;

      const canonicalAllyId = CountryRegistry.resolveCanonicalId(targetId);
      const ally = updatedNations[targetId] || updatedNations[canonicalAllyId];
      if (
        !ally ||
        !ally.isAlive ||
        ally.id === attacker.id ||
        ally.id === defender.id
      ) {
        continue;
      }

      const allyPower = MilitaryPowerCalculator.calculateEffectivePower(ally);
      const isStrongEnough = allyPower >= attackerPower * 0.35;

      const relWithAttacker =
        ally.relations[attacker.id] ||
        ally.relations[CountryRegistry.resolveCanonicalId(attacker.id)];

      const hasActiveTreatyWithAttacker =
        relWithAttacker?.stance === "NON_AGGRESSION_PACT" ||
        relWithAttacker?.stance === "ALLIANCE";
      const hasGoodOpinionWithAttacker = (relWithAttacker?.opinion ?? 0) >= 40;

      if (
        isStrongEnough &&
        !hasActiveTreatyWithAttacker &&
        !hasGoodOpinionWithAttacker
      ) {
        interveningAllyIds.push(ally.id);

        const currentGrudge = relWithAttacker?.grudge ?? 0;
        const updatedAllyRelations = {
          ...ally.relations,
          [attacker.id]: {
            targetNationId: attacker.id,
            stance: "WAR" as const,
            opinion: -100,
            grudge: Math.min(100, currentGrudge + 35),
          },
        };

        updatedNations[ally.id] = {
          ...ally,
          warFocusTargetId: attacker.id,
          relations: updatedAllyRelations,
        };

        const currentAttacker = updatedNations[attacker.id] || attacker;
        const attackerGrudgeWithAlly =
          currentAttacker.relations[ally.id]?.grudge ?? 0;
        const updatedAttackerRelations = {
          ...currentAttacker.relations,
          [ally.id]: {
            targetNationId: ally.id,
            stance: "WAR" as const,
            opinion: -100,
            grudge: Math.min(100, attackerGrudgeWithAlly + 20),
          },
        };

        updatedNations[attacker.id] = {
          ...currentAttacker,
          relations: updatedAttackerRelations,
        };
      } else {
        dishonoringAllyIds.push(ally.id);

        const updatedAllyRelations = {
          ...ally.relations,
          [defender.id]: {
            targetNationId: defender.id,
            stance: "NORMAL_DIPLOMACY" as const,
            opinion: Math.min(ally.relations[defender.id]?.opinion ?? 0, 0),
            grudge: Math.min(
              100,
              (ally.relations[defender.id]?.grudge ?? 0) + 10,
            ),
          },
        };

        updatedNations[ally.id] = {
          ...ally,
          globalReputation: Math.max(-100, ally.globalReputation - 10),
          relations: updatedAllyRelations,
        };

        const currentDefender = updatedNations[defender.id] || defender;
        const defenderGrudgeWithAlly =
          currentDefender.relations[ally.id]?.grudge ?? 0;
        const updatedDefenderRelations = {
          ...currentDefender.relations,
          [ally.id]: {
            targetNationId: ally.id,
            stance: "NORMAL_DIPLOMACY" as const,
            opinion: -30,
            grudge: Math.min(100, defenderGrudgeWithAlly + 45),
          },
        };

        updatedNations[defender.id] = {
          ...currentDefender,
          relations: updatedDefenderRelations,
        };
      }
    }

    return {
      interveningAllyIds,
      dishonoringAllyIds,
      updatedNations,
    };
  }
}
