import { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

export class PoliticsTurnProcessor {
  public static process(
    nation: Nation,
    isAtWar: boolean,
    allNations?: Record<string, Nation>,
  ): Nation {
    const updated = ModifierManager.updateActiveModifiers(nation);

    const newStability = StabilityCalculator.calculateTurnStability(
      updated,
      isAtWar,
      allNations,
    );

    return {
      ...updated,
      executedEspionageTiers: [],
      attackedTargetIdsThisTurn: [],
      sentAidTargetIdsThisTurn: [],
      hasBoughtProvinceThisTurn: false,
      boostedProjectIdsThisTurn: [],
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
