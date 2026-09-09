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
    const updated = ModifierManager.updateActiveModifiers(nation);

    const newStability = StabilityCalculator.calculateTurnStability(
      updated,
      isAtWar,
      turnContext.state.nations,
    );

    return {
      ...updated,
      government: {
        ...updated.government,
        stability: newStability,
        turnsInPower: updated.government.turnsInPower + 1,
      },
      globalReputation: !isAtWar
        ? Math.min(100, updated.globalReputation + 1)
        : updated.globalReputation,
    };
  }
}
