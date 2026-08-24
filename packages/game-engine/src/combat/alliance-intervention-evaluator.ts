import {
  Nation,
  CountryRegistry,
  MilitaryPowerCalculator,
  GeopoliticalReachResolver,
  NationGettersUtility,
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

      const hasLandBorder = GeopoliticalReachResolver.hasDirectLandBorder(
        ally,
        attacker,
      );
      const allySea =
        (ally.military.navalFleet || 0) > 0 ||
        NationGettersUtility.hasSeaAccess(ally.id);
      const attackerSea =
        (attacker.military.navalFleet || 0) > 0 ||
        NationGettersUtility.hasSeaAccess(attacker.id);
      const hasNavalRoute = allySea && attackerSea;
      const canReachAttacker = hasLandBorder || hasNavalRoute;

      if (!canReachAttacker) {
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

        const updatedAllyRelations = {
          ...ally.relations,
          [attacker.id]: {
            targetNationId: attacker.id,
            stance: "WAR" as const,
            alignment: -100,
            tension: 100,
          },
        };

        updatedNations[ally.id] = {
          ...ally,
          warFocusTargetId: attacker.id,
          relations: updatedAllyRelations,
        };

        const currentAttacker = updatedNations[attacker.id] || attacker;
        const updatedAttackerRelations = {
          ...currentAttacker.relations,
          [ally.id]: {
            targetNationId: ally.id,
            stance: "WAR" as const,
            alignment: -100,
            tension: 100,
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
            alignment: -30,
            tension: 40,
          },
        };

        updatedNations[ally.id] = {
          ...ally,
          globalReputation: Math.max(-100, ally.globalReputation - 10),
          relations: updatedAllyRelations,
        };

        const currentDefender = updatedNations[defender.id] || defender;
        if (currentDefender.isAlive) {
          const updatedDefenderRelations = {
            ...currentDefender.relations,
            [ally.id]: {
              targetNationId: ally.id,
              stance: "NORMAL_DIPLOMACY" as const,
              alignment: -60,
              tension: 70,
            },
          };

          updatedNations[defender.id] = {
            ...currentDefender,
            relations: updatedDefenderRelations,
          };
        }
      }
    }

    return {
      interveningAllyIds,
      dishonoringAllyIds,
      updatedNations,
    };
  }
}
