import { GameState } from "@/domain/game/game-state.schema";
import { ActivateAbilityAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActiveModifier } from "@/domain/nation/nation.schema";
import { AbilityHandler } from "./ability-handler.interface";

export class RoyalDecreeHandler implements AbilityHandler {
  public supports(abilityType: string): boolean {
    return abilityType === "ROYAL_DECREE";
  }

  public execute(state: GameState, action: ActivateAbilityAction): GameState {
    const nationId = action.nationId;
    const nation = state.nations[nationId];
    if (!nation || !nation.isAlive) {
      return state;
    }

    if (nation.government.type !== "MONARCHY") {
      throw new GameError(
        "INVALID_ACTION",
        "Only monarchies can issue a Royal Decree.",
      );
    }
    if (nation.activeModifiers.some((m) => m.id === "cooldown-royal-decree")) {
      throw new GameError("INVALID_ACTION", "Royal Decree is on cooldown.");
    }
    if (nation.treasury < 40000) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Insufficient treasury to issue decree.",
      );
    }

    const cooldown: ActiveModifier = {
      id: "cooldown-royal-decree",
      name: "Decree Cooldown",
      effectType: "COOLDOWN",
      magnitude: 0,
      turnsRemaining: 20,
    };

    const updatedNations = { ...state.nations };
    updatedNations[nationId] = {
      ...nation,
      treasury: nation.treasury - 40000,
      globalReputation: Math.min(100, nation.globalReputation + 15),
      activeModifiers: [...nation.activeModifiers, cooldown],
    };

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
