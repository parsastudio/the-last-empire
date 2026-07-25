import { GameState } from "@/domain/game/game-state.schema";
import { ActivateAbilityAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActiveModifier } from "@/domain/nation/nation.schema";
import { AbilityHandler } from "./ability-handler.interface";

export class IndustrialMobilizationHandler implements AbilityHandler {
  public supports(abilityType: string): boolean {
    return abilityType === "INDUSTRIAL_MOBILIZATION";
  }

  public execute(state: GameState, action: ActivateAbilityAction): GameState {
    const nationId = action.nationId;
    const nation = state.nations[nationId];
    if (!nation || !nation.isAlive) {
      return state;
    }

    if (nation.government.type !== "COMMUNISM") {
      throw new GameError(
        "INVALID_ACTION",
        "Only communist regimes can trigger Industrial Mobilization.",
      );
    }
    if (nation.resources.manpower < 50) {
      throw new GameError(
        "INVALID_ACTION",
        "Must have at least 50 manpower to execute Industrial Mobilization.",
      );
    }
    if (
      nation.activeModifiers.some(
        (m) => m.id === "cooldown-industrial-mobilization",
      )
    ) {
      throw new GameError(
        "INVALID_ACTION",
        "Industrial Mobilization is on cooldown.",
      );
    }

    const sacrificedManpower = Math.floor(nation.resources.manpower * 0.15);

    const activeMod: ActiveModifier = {
      id: "industrial-mobilization-active",
      name: "Industrial Mobilization",
      effectType: "GDP_GROWTH_MULT",
      magnitude: 0.05,
      turnsRemaining: 5,
    };

    const cooldown: ActiveModifier = {
      id: "cooldown-industrial-mobilization",
      name: "Mobilization Cooldown",
      effectType: "COOLDOWN",
      magnitude: 0,
      turnsRemaining: 25,
    };

    const updatedNations = { ...state.nations };
    updatedNations[nationId] = {
      ...nation,
      resources: {
        ...nation.resources,
        manpower: nation.resources.manpower - sacrificedManpower,
      },
      government: {
        ...nation.government,
        stability: Math.max(0, nation.government.stability - 15),
      },
      activeModifiers: [...nation.activeModifiers, activeMod, cooldown],
    };

    return {
      ...state,
      nations: updatedNations,
    };
  }
}
