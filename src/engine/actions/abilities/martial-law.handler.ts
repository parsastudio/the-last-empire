import { GameState } from "@/domain/game/game-state.schema";
import { ActivateAbilityAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActiveModifier } from "@/domain/nation/nation.schema";
import { AbilityHandler } from "./ability-handler.interface";

export class MartialLawHandler implements AbilityHandler {
  public supports(abilityType: string): boolean {
    return abilityType === "MARTIAL_LAW";
  }

  public execute(state: GameState, action: ActivateAbilityAction): GameState {
    const nationId = action.nationId;
    const nation = state.nations[nationId];
    if (!nation || !nation.isAlive) {
      return state;
    }

    if (nation.government.type !== "DICTATORSHIP") {
      throw new GameError(
        "INVALID_ACTION",
        "Only dictatorships can declare Martial Law.",
      );
    }
    if (nation.activeModifiers.some((m) => m.id === "cooldown-martial-law")) {
      throw new GameError("INVALID_ACTION", "Martial Law is on cooldown.");
    }

    const activeMod: ActiveModifier = {
      id: "martial-law-active",
      name: "Martial Law",
      effectType: "STABILITY_DELTA",
      magnitude: 5,
      turnsRemaining: 5,
    };

    const cooldownMod: ActiveModifier = {
      id: "cooldown-martial-law",
      name: "Martial Law Cooldown",
      effectType: "COOLDOWN",
      magnitude: 0,
      turnsRemaining: 20,
    };

    const updatedNations = { ...state.nations };
    updatedNations[nationId] = {
      ...nation,
      government: {
        ...nation.government,
        stability: Math.min(100, nation.government.stability + 15),
      },
      activeModifiers: [...nation.activeModifiers, activeMod, cooldownMod],
    };

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
