import { GameState } from "@/domain/game/game-state.schema";
import { ActivateAbilityAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActiveModifier } from "@/domain/nation/nation.schema";
import { AbilityHandler } from "./ability-handler.interface";

export class DiplomaticSummitHandler implements AbilityHandler {
  public supports(abilityType: string): boolean {
    return abilityType === "DIPLOMATIC_SUMMIT";
  }

  public execute(state: GameState, action: ActivateAbilityAction): GameState {
    const nationId = action.nationId;
    const nation = state.nations[nationId];
    if (!nation || !nation.isAlive) {
      return state;
    }

    if (nation.government.type !== "DEMOCRACY") {
      throw new GameError(
        "INVALID_ACTION",
        "Only democracies can convene a Diplomatic Summit.",
      );
    }
    if (
      nation.activeModifiers.some((m) => m.id === "cooldown-diplomatic-summit")
    ) {
      throw new GameError(
        "INVALID_ACTION",
        "Diplomatic Summit is on cooldown.",
      );
    }
    if (nation.treasury < 20000) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Insufficient treasury to convene summit.",
      );
    }
    const targetId = action.targetNationId;
    if (!targetId) {
      throw new GameError(
        "INVALID_ACTION",
        "Target nation required for Diplomatic Summit.",
      );
    }
    const relation = nation.relations[targetId];
    if (!relation) {
      throw new GameError(
        "NATION_NOT_FOUND",
        "Target nation relations not found.",
      );
    }

    const updatedRelations = {
      ...nation.relations,
      [targetId]: {
        ...relation,
        opinion: Math.min(100, relation.opinion + 20),
      },
    };

    const targetNation = state.nations[targetId];
    const targetRelations = { ...targetNation?.relations };
    if (targetNation && targetRelations[nationId]) {
      const targetRel = targetRelations[nationId];
      if (targetRel) {
        targetRelations[nationId] = {
          ...targetRel,
          opinion: Math.min(100, targetRel.opinion + 20),
        };
      }
    }

    const cooldown: ActiveModifier = {
      id: "cooldown-diplomatic-summit",
      name: "Summit Cooldown",
      effectType: "COOLDOWN",
      magnitude: 0,
      turnsRemaining: 12,
    };

    const updatedNations = { ...state.nations };
    updatedNations[nationId] = {
      ...nation,
      treasury: nation.treasury - 20000,
      globalReputation: Math.min(100, nation.globalReputation + 10),
      relations: updatedRelations,
      activeModifiers: [...nation.activeModifiers, cooldown],
    };

    if (targetNation) {
      updatedNations[targetId] = {
        ...targetNation,
        relations: targetRelations,
      };
    }

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
