import { GameState } from "@/domain/game/game-state.schema";
import { ActivateAbilityAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActiveModifier } from "@/domain/nation/nation.schema";
import { AbilityHandler } from "./ability-handler.interface";

export class WarAlertHandler implements AbilityHandler {
  public supports(abilityType: string): boolean {
    return abilityType === "WAR_ALERT";
  }

  public execute(state: GameState, action: ActivateAbilityAction): GameState {
    const nationId = action.nationId;
    const nation = state.nations[nationId];
    if (!nation || !nation.isAlive) {
      return state;
    }

    if (nation.government.type !== "FASCISM") {
      throw new GameError(
        "INVALID_ACTION",
        "Only fascist regimes can trigger War Alert.",
      );
    }
    if (nation.activeModifiers.some((m) => m.id === "cooldown-war-alert")) {
      throw new GameError("INVALID_ACTION", "War Alert is on cooldown.");
    }

    const alertDebuff: ActiveModifier = {
      id: "war-alert-active",
      name: "War Alert Mobilization",
      effectType: "GDP_GROWTH_MULT",
      magnitude: -0.15,
      turnsRemaining: 5,
    };

    const cooldown: ActiveModifier = {
      id: "cooldown-war-alert",
      name: "War Alert Cooldown",
      effectType: "COOLDOWN",
      magnitude: 0,
      turnsRemaining: 20,
    };

    const updatedNations = { ...state.nations };
    updatedNations[nationId] = {
      ...nation,
      activeModifiers: [...nation.activeModifiers, alertDebuff, cooldown],
    };

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
