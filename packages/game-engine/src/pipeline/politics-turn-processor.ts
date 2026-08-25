import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

export class PoliticsTurnProcessor {
  public static process(
    nation: Nation,
    _allNations: Record<string, Nation>,
    isAtWar: boolean,
    _provincesMap?: Record<string, Province>,
  ): Nation {
    let updated = ModifierManager.updateActiveModifiers(nation);

    const newStability = StabilityCalculator.calculateTurnStability(
      updated,
      isAtWar,
    );

    updated = {
      ...updated,
      executedEspionageTiers: [],
      government: {
        ...updated.government,
        stability: newStability,
        turnsInPower: updated.government.turnsInPower + 1,
      },
    };

    if (!isAtWar) {
      updated = {
        ...updated,
        globalReputation: Math.min(100, updated.globalReputation + 1),
      };
    }

    return updated;
  }
}
