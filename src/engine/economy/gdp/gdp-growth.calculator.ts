import { Nation } from "@/domain/nation/nation.schema";
import { TraitManager } from "@/engine/politics/trait-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { ModifierManager } from "@/engine/politics/modifier-manager";

export class GdpGrowthCalculator {
  private traitManager = new TraitManager();
  private governmentSystem = new GovernmentSystem();
  private modifierManager = new ModifierManager();

  public calculateGdpGrowthMultiplier(nation: Nation): number {
    const currentStability = nation.government.stability;

    let stabilityFactor = -0.05 + (currentStability / 100) * 0.075;

    stabilityFactor += this.traitManager.getGdpGrowthModifier(nation);

    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    stabilityFactor += govTraits.economicGrowthBonus;

    stabilityFactor += this.modifierManager.getModifierImpact(
      nation,
      "GDP_GROWTH_MULT",
    );

    const isMartialLawActive = nation.activeModifiers.some(
      (m) => m.id === "martial-law-active",
    );
    if (isMartialLawActive) {
      stabilityFactor -= 0.02;
    }

    return Math.max(0.85, 1.0 + stabilityFactor);
  }
}
