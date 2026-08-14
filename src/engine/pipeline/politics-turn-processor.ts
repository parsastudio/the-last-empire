import { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { ReputationManager } from "@/engine/diplomacy/diplomacy-engine";

export class PoliticsTurnProcessor {
  private static reputationManager = new ReputationManager();

  public static process(
    nation: Nation,
    allNations: Record<string, Nation>,
    isAtWar: boolean,
  ): Nation {
    let updated = ModifierManager.updateActiveModifiers(nation);

    const newStability = StabilityCalculator.calculateTurnStability(
      updated,
      allNations,
    );

    updated = {
      ...updated,
      government: {
        ...updated.government,
        stability: newStability,
        turnsInPower: updated.government.turnsInPower + 1,
      },
    };

    if (!isAtWar) {
      updated = this.reputationManager.applyReputationGain(updated, 1);
    }

    return updated;
  }
}
