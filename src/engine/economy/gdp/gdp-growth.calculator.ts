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
    peacefulNeighborsCount: number,
  ): number {
    let growthRate = 0.0;

    const currentStability = nation.government.stability;
    if (currentStability >= 70) {
      growthRate += 0.005 + ((currentStability - 70) / 100) * 0.015;
    } else if (currentStability < 50) {
      growthRate -= 0.005 + ((50 - currentStability) / 100) * 0.02;
    }

    const activeEmbargoesCount = Object.values(nation.relations).filter(
      (rel) => rel.isTradeEmbargoed === true,
    ).length;

    const netTradeNeighbors = Math.max(
      0,
      peacefulNeighborsCount - activeEmbargoesCount,
    );
    growthRate += netTradeNeighbors * 0.0015;

    if (activeEmbargoesCount > 0) {
      growthRate -= activeEmbargoesCount * 0.002;
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

    const baseGdpForScale = nation.gdp || 1000000;
    const logScale = Math.max(1, Math.log10(baseGdpForScale / 1000000));
    const dampenedGrowthRate = growthRate / logScale;

    return Math.max(0.95, 1.0 + dampenedGrowthRate);
  }
}
