import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { CountryRegistry } from "@/domain/data/countries";

export class DiplomaticTurnProcessor {
  private static calculateBaselineOpinion(
    currentGov: string,
    targetGov?: string,
    stance?: string,
  ): number {
    let baseline = 0;
    if (targetGov) {
      if (currentGov === targetGov) {
        baseline = 15;
      } else if (
        (currentGov === "DEMOCRACY" &&
          (targetGov === "DICTATORSHIP" ||
            targetGov === "FASCISM" ||
            targetGov === "COMMUNISM")) ||
        (targetGov === "DEMOCRACY" &&
          (currentGov === "DICTATORSHIP" ||
            currentGov === "FASCISM" ||
            currentGov === "COMMUNISM"))
      ) {
        baseline = -15;
      } else if (currentGov !== "DEMOCRACY" && targetGov !== "DEMOCRACY") {
        baseline = 10;
      }
    }

    if (stance === "ALLIANCE") {
      return Math.max(baseline, 50);
    }
    if (stance === "NON_AGGRESSION_PACT") {
      return Math.max(baseline, 25);
    }
    return baseline;
  }

  public static processPendingProposalsForAi(state: GameState): GameState {
    const validPendingProposals = state.pendingProposals.filter(
      (proposal) => state.currentTurn <= proposal.expiresTurn,
    );

    if (validPendingProposals.length === state.pendingProposals.length) {
      return state;
    }

    return {
      ...state,
      pendingProposals: validPendingProposals,
    };
  }

  public static process(
    nation: Nation,
    allNations?: Record<string, Nation>,
  ): {
    updatedNation: Nation;
    isAtWar: boolean;
  } {
    if (!nation.relations) {
      return { updatedNation: nation, isAtWar: false };
    }

    let isAtWar = false;
    const relKeys = Object.keys(nation.relations);
    const newRels: Record<string, RelationProfile> = {
      ...nation.relations,
    };

    for (let j = 0; j < relKeys.length; j++) {
      const targetId = relKeys[j]!;
      const relation = newRels[targetId];
      if (!relation) continue;

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const targetNation = allNations
        ? allNations[targetId] || allNations[canonicalTarget]
        : null;

      if (relation.stance === "WAR") {
        if (targetNation && targetNation.isAlive) {
          isAtWar = true;
        }
      }

      let nextOpinion = relation.opinion;
      if (relation.stance !== "WAR") {
        const baseline = this.calculateBaselineOpinion(
          nation.government.type,
          targetNation?.government.type,
          relation.stance,
        );
        if (relation.opinion < baseline) {
          nextOpinion = Math.min(baseline, relation.opinion + 1);
        } else if (relation.opinion > baseline) {
          nextOpinion = Math.max(baseline, relation.opinion - 1);
        }
      }

      let nextGrudge = relation.grudge ?? 0;
      if (relation.stance !== "WAR" && nextGrudge > 0) {
        nextGrudge = Math.max(0, nextGrudge - 2);
      }

      newRels[targetId] = {
        ...relation,
        opinion: nextOpinion,
        grudge: nextGrudge,
      };
    }

    let nextWarFocus = nation.warFocusTargetId ?? null;
    if (nextWarFocus) {
      const focusRel = newRels[nextWarFocus];
      const canonicalFocus = CountryRegistry.resolveCanonicalId(nextWarFocus);
      const focusTarget = allNations
        ? allNations[nextWarFocus] || allNations[canonicalFocus]
        : null;
      const isFocusAlive = focusTarget ? focusTarget.isAlive : true;

      if (!focusRel || focusRel.stance !== "WAR" || !isFocusAlive) {
        nextWarFocus = null;
      }
    }

    return {
      updatedNation: {
        ...nation,
        relations: newRels,
        warFocusTargetId: nextWarFocus,
      },
      isAtWar,
    };
  }
}
