import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { ModifierManager } from "@/engine/politics/modifier-manager";

export class GdpGrowthCalculator {
  private governmentSystem = new GovernmentSystem();
  private modifierManager = new ModifierManager();

  public calculateGdpGrowthMultiplier(
    nation: Nation,
    _peacefulNeighborsCount = 0,
  ): number {
    let growthRate = 0.0;

    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    growthRate += govTraits.economicGrowthBonus * 0.1;

    if (nation.taxRate < 15) {
      growthRate += 0.005;
    } else if (nation.taxRate > 25) {
      growthRate -= (nation.taxRate - 25) * 0.001;
    }

    if (nation.government.stability > 70) {
      growthRate += 0.005;
    } else if (nation.government.stability < 30) {
      growthRate -= 0.01;
    }

    if (nation.tariffRate > 10) {
      growthRate -= (nation.tariffRate - 10) * 0.001;
    }

    if (nation.traits.includes("INDUSTRIAL_HUB")) {
      growthRate += 0.005;
    }
    if (nation.traits.includes("FRAGILE_ECONOMY")) {
      growthRate -= 0.005;
    }

    const isMartialLawActive = nation.activeModifiers.some(
      (m) => m.id === "martial-law-active",
    );
    if (isMartialLawActive) {
      growthRate -= 0.02;
    }

    growthRate += this.modifierManager.getModifierImpact(
      nation,
      "GDP_GROWTH_MULT",
    );

    let sizeMultiplier = 1.0;
    if (nation.gdp < 50000000000) {
      sizeMultiplier = 2.0;
    } else if (nation.gdp <= 200000000000) {
      sizeMultiplier = 1.5;
    }

    const finalRate = growthRate * sizeMultiplier;

    return Math.max(0.95, 1.0 + finalRate);
  }
}
