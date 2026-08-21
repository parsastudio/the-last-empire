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

  private static calculateGrudgeDecay(
    currentGrudge: number,
    stance: string,
    govType: string,
    opinion: number,
    targetReputation = 0,
  ): number {
    if (currentGrudge <= 0) return 0;

    const baseDecay = Math.max(3, Math.ceil(currentGrudge * 0.1));

    let stanceBonus = 0;
    if (stance === "ALLIANCE") {
      stanceBonus = 8;
    } else if (stance === "NON_AGGRESSION_PACT") {
      stanceBonus = 4;
    }

    let opinionBonus = 0;
    if (opinion >= 20) {
      opinionBonus = 3;
    } else if (opinion > 0) {
      opinionBonus = 1;
    }

    let repBonus = 0;
    if (targetReputation >= 40) {
      repBonus = 2;
    } else if (targetReputation <= -30) {
      repBonus = -2;
    }

    let govMultiplier = 1.0;
    if (govType === "DEMOCRACY") {
      govMultiplier = 1.4;
    } else if (govType === "DICTATORSHIP" || govType === "FASCISM") {
      govMultiplier = 0.8;
    }

    const rawDecay =
      (baseDecay + stanceBonus + opinionBonus + repBonus) * govMultiplier;
    return Math.max(1, Math.round(rawDecay));
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
        ? allNations[canonicalTarget] || allNations[targetId]
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
        const targetRep = targetNation ? targetNation.globalReputation : 0;
        const decay = this.calculateGrudgeDecay(
          nextGrudge,
          relation.stance,
          nation.government.type,
          relation.opinion,
          targetRep,
        );
        nextGrudge = Math.max(0, nextGrudge - decay);
      }

      newRels[targetId] = {
        ...relation,
        opinion: nextOpinion,
        grudge: nextGrudge,
      };
    }

    let nextWarFocus = nation.warFocusTargetId ?? null;
    if (nextWarFocus) {
      const canonicalFocus = CountryRegistry.resolveCanonicalId(nextWarFocus);
      const focusRel = newRels[canonicalFocus] || newRels[nextWarFocus];
      const focusTarget = allNations
        ? allNations[canonicalFocus] || allNations[nextWarFocus]
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
