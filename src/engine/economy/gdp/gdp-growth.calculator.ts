import { Nation } from "@/domain/nation/nation.schema";
import { TraitManager } from "@/engine/politics/trait-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { ModifierManager } from "@/engine/politics/modifier-manager";

export class GdpGrowthCalculator {
  private traitManager = new TraitManager();
  private governmentSystem = new GovernmentSystem();
  private modifierManager = new ModifierManager();

  public calculateGdpGrowthMultiplier(
    nation: Nation,
    _peacefulNeighborsCount = 0,
  ): number {
    let growthRate = 0.0;

    const currentStability = nation.government.stability;
    if (currentStability >= 50) {
      growthRate += ((currentStability - 50) / 50) * 0.025;
    } else {
      growthRate += ((currentStability - 50) / 50) * 0.05;
    }

    growthRate += this.traitManager.getGdpGrowthModifier(nation) * 0.1;
    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    growthRate += govTraits.economicGrowthBonus * 0.1;

    growthRate += this.modifierManager.getModifierImpact(
      nation,
      "GDP_GROWTH_MULT",
    );

    const isMartialLawActive = nation.activeModifiers.some(
      (m) => m.id === "martial-law-active",
    );
    if (isMartialLawActive) {
      growthRate -= 0.02;
    }

    return Math.max(0.9, 1.0 + growthRate);
  }
}
