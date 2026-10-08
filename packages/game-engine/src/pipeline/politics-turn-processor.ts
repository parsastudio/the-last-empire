import { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class PoliticsTurnProcessor {
  public static process(
    nation: Nation,
    isAtWar: boolean,
    turnContext: TurnContext,
  ): Nation {
    if (nation.activeModifiers && nation.activeModifiers.length > 0) {
      ModifierManager.updateActiveModifiersInPlace(nation);
    }

    const newStability = StabilityCalculator.calculateTurnStability(
      nation,
      isAtWar,
      turnContext.state.nations,
    );

    nation.government.stability = newStability;
    nation.government.turnsInPower += 1;

    if (!isAtWar) {
      nation.globalReputation = Math.min(100, nation.globalReputation + 1);
    }

    return nation;
  }
}
