import {
  Nation,
  CountryRegistry,
  MilitaryPowerCalculator,
} from "@geopolitics/domain";

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
      const ally = updatedNations[canonicalAllyId] || updatedNations[targetId];
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
        ally.relations[CountryRegistry.resolveCanonicalId(attacker.id)] ||
        ally.relations[attacker.id];

      const hasActiveTreatyWithAttacker =
        relWithAttacker?.stance === "NON_AGGRESSION_PACT" ||
        relWithAttacker?.stance === "ALLIANCE";
      const hasGoodAlignmentWithAttacker =
        (relWithAttacker?.alignment ?? 0) >= 40;

      if (
        isStrongEnough &&
        !hasActiveTreatyWithAttacker &&
        !hasGoodAlignmentWithAttacker
      ) {
        interveningAllyIds.push(ally.id);

        const currentGrudge = relWithAttacker?.grudge ?? 0;
        const updatedAllyRelations = {
          ...ally.relations,
          [attacker.id]: {
            targetNationId: attacker.id,
            stance: "WAR" as const,
            alignment: -100,
            tension: 100,
            grudge: Math.min(100, currentGrudge + 35),
            lostProvincesCount: relWithAttacker?.lostProvincesCount ?? 0,
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
            alignment: -100,
            tension: 100,
            grudge: Math.min(100, attackerGrudgeWithAlly + 20),
            lostProvincesCount:
              currentAttacker.relations[ally.id]?.lostProvincesCount ?? 0,
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
            alignment: -20,
            tension: 40,
            grudge: Math.min(
              100,
              (ally.relations[defender.id]?.grudge ?? 0) + 10,
            ),
            lostProvincesCount:
              ally.relations[defender.id]?.lostProvincesCount ?? 0,
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
            alignment: -40,
            tension: 60,
            grudge: Math.min(100, defenderGrudgeWithAlly + 45),
            lostProvincesCount:
              currentDefender.relations[ally.id]?.lostProvincesCount ?? 0,
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
