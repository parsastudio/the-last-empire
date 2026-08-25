import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@geopolitics/domain";

export class PoliticsTurnProcessor {
  public static process(
    nation: Nation,
    allNations: Record<string, Nation>,
    isAtWar: boolean,
    provincesMap?: Record<string, Province>,
  ): Nation {
    let updated = ModifierManager.updateActiveModifiers(nation);

    let isBlockaded = false;
    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);

    if (isAtWar && updated.relations && hasSea) {
      const myNavalPower =
        (updated.military.navalFleet || 0) * (updated.military.techLevel || 1);

      for (const [relTargetId, rel] of Object.entries(updated.relations)) {
        if (rel.stance === "WAR") {
          const canonical = CountryRegistry.resolveCanonicalId(relTargetId);
          const enemy = allNations[canonical] || allNations[relTargetId];

          if (enemy && enemy.isAlive) {
            const enemyNavalPower =
              (enemy.military.navalFleet || 0) *
              (enemy.military.techLevel || 1);

            if (enemyNavalPower > myNavalPower) {
              isBlockaded = true;
              break;
            }
          }
        }
      }
    }

    const newStability = StabilityCalculator.calculateTurnStability(
      updated,
      isAtWar,
      isBlockaded,
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
      updated = {
        ...updated,
        globalReputation: Math.min(100, updated.globalReputation + 1),
      };
    }

    return updated;
  }
}
