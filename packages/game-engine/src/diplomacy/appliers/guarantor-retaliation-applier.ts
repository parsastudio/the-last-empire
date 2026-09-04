import {
  GameState,
  Nation,
  CountryRegistry,
  TurnLogBuilder,
  RelationProfile,
  TurnLogEntry,
} from "@geopolitics/domain";

export class GuarantorRetaliationApplier {
  public static apply(
    state: GameState,
    attackerId: string,
    targetId: string,
  ): {
    updatedNations: Record<string, Nation>;
    retaliationLogs: TurnLogEntry[];
  } {
    const canonicalHuman = CountryRegistry.resolveCanonicalId(
      state.humanNationId,
    );
    const canonicalAttacker = CountryRegistry.resolveCanonicalId(attackerId);

    if (canonicalAttacker !== canonicalHuman) {
      return { updatedNations: state.nations, retaliationLogs: [] };
    }

    const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
    const target = state.nations[canonicalTarget] || state.nations[targetId];

    if (!target || !target.isAlive) {
      return { updatedNations: state.nations, retaliationLogs: [] };
    }

    const defendersToRetaliate: Array<{
      nationId: string;
      reason: "STRATEGIC_PARTNER";
    }> = [];

    for (const [otherId, rel] of Object.entries(target.relations || {})) {
      if (rel.stance === "STRATEGIC_PARTNERSHIP") {
        const pCanonical = CountryRegistry.resolveCanonicalId(otherId);
        if (
          pCanonical !== canonicalHuman &&
          !defendersToRetaliate.some((d) => d.nationId === pCanonical)
        ) {
          const partnerNation =
            state.nations[pCanonical] || state.nations[otherId];

          const partnerRelWithTarget =
            partnerNation?.relations?.[canonicalTarget] ||
            partnerNation?.relations?.[target.id];

          if (partnerRelWithTarget?.stance === "STRATEGIC_PARTNERSHIP") {
            defendersToRetaliate.push({
              nationId: pCanonical,
              reason: "STRATEGIC_PARTNER",
            });
          }
        }
      }
    }

    if (defendersToRetaliate.length === 0) {
      return { updatedNations: state.nations, retaliationLogs: [] };
    }

    const updatedNations: Record<string, Nation> = { ...state.nations };
    const retaliationLogs: TurnLogEntry[] = [];

    const humanNation = updatedNations[canonicalHuman];
    if (!humanNation) {
      return { updatedNations: state.nations, retaliationLogs: [] };
    }

    const updatedHumanRelations: Record<string, RelationProfile> = {
      ...(humanNation.relations || {}),
    };

    for (let i = 0; i < defendersToRetaliate.length; i++) {
      const item = defendersToRetaliate[i]!;
      const defenderNation =
        updatedNations[item.nationId] || state.nations[item.nationId];

      if (!defenderNation || !defenderNation.isAlive) continue;

      const existingRel = defenderNation.relations?.[canonicalHuman];
      if (existingRel?.stance === "WAR") continue;

      const humanRelWithDefender = humanNation.relations?.[item.nationId];
      const hasPeacePact =
        existingRel?.stance === "STRATEGIC_PARTNERSHIP" ||
        existingRel?.stance === "NON_AGGRESSION_PACT" ||
        humanRelWithDefender?.stance === "STRATEGIC_PARTNERSHIP" ||
        humanRelWithDefender?.stance === "NON_AGGRESSION_PACT";

      if (hasPeacePact) {
        continue;
      }

      const defRelations: Record<string, RelationProfile> = {
        ...(defenderNation.relations || {}),
        [canonicalHuman]: {
          targetNationId: canonicalHuman,
          stance: "WAR",
          alignment: -100,
          tension: 100,
          warDeclaredTurn: state.currentTurn,
          warInitiatorId: defenderNation.id,
        },
      };

      updatedNations[defenderNation.id] = {
        ...defenderNation,
        relations: defRelations,
        warFocusTargetId: canonicalHuman,
      };

      updatedHumanRelations[item.nationId] = {
        targetNationId: item.nationId,
        stance: "WAR",
        alignment: -100,
        tension: 100,
        warDeclaredTurn: state.currentTurn,
        warInitiatorId: defenderNation.id,
      };

      retaliationLogs.push(
        TurnLogBuilder.createGlobalWarLog(
          state.currentTurn,
          defenderNation.id,
          canonicalHuman,
          "WAR_DECLARED",
          {
            isRetaliation: true,
            retaliationReason: item.reason,
            protectedTargetId: canonicalTarget,
            protectedTargetName: target.name,
          },
          "CRITICAL",
        ),
      );
    }

    updatedNations[canonicalHuman] = {
      ...humanNation,
      relations: updatedHumanRelations,
    };

    return { updatedNations, retaliationLogs };
  }
}
