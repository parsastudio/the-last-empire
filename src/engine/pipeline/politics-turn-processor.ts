import { Nation } from "@/domain/nation/nation.schema";
import { ModifierManager } from "@/engine/politics/modifier-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { ReputationManager } from "@/engine/diplomacy/diplomacy-engine";
import { CountryRegistry } from "@/domain/data/countries";

export class PoliticsTurnProcessor {
  private static reputationManager = new ReputationManager();

  public static process(
    nation: Nation,
    allNations: Record<string, Nation>,
    isAtWar: boolean,
  ): Nation {
    let updated = ModifierManager.updateActiveModifiers(nation);

    let isBlockaded = false;
    if (isAtWar && updated.relations) {
      const myNavalPower =
        (updated.military.navalFleet || 0) * (updated.military.techLevel || 1);

      for (const [relTargetId, rel] of Object.entries(updated.relations)) {
        if (rel.stance === "WAR") {
          const canonical = CountryRegistry.resolveCanonicalId(relTargetId);
          const enemy = allNations[relTargetId] || allNations[canonical];

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
      updated = this.reputationManager.applyReputationGain(updated, 1);
    }

    return updated;
  }
}
