import { Nation } from "@/domain/nation/nation.schema";
import { TraitManager } from "@/engine/politics/trait-manager";
import { TariffCalculator } from "@/engine/economy/tariff-calculator";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { ModifierManager } from "@/engine/politics/modifier-manager";

export class GdpGrowthCalculator {
  private traitManager = new TraitManager();
  private tariffCalculator = new TariffCalculator();
  private governmentSystem = new GovernmentSystem();
  private modifierManager = new ModifierManager();

  public calculateGdpGrowthMultiplier(
    nation: Nation,
    peacefulNeighborsCount: number,
  ): number {
    let growthRate = 0.0;
    if (nation.taxRate < 15) {
      growthRate += 0.003;
    } else if (nation.taxRate > 25) {
      growthRate -= (nation.taxRate - 25) * 0.0008;
    }
    if (nation.government.stability > 70) {
      growthRate += 0.002;
    } else if (nation.government.stability < 30) {
      growthRate -= 0.005;
    }

    const activeEmbargoesCount = Object.values(nation.relations).filter(
      (rel) => rel.isTradeEmbargoed === true,
    ).length;

    const netTradeNeighbors = Math.max(
      0,
      peacefulNeighborsCount - activeEmbargoesCount,
    );
    const tradeBonus = netTradeNeighbors * 0.0015;
    growthRate += tradeBonus;

    if (activeEmbargoesCount > 0) {
      growthRate -= activeEmbargoesCount * 0.002;
    }

    const tariffResult = this.tariffCalculator.calculateTariffEffects(nation);
    growthRate -= tariffResult.gdpGrowthPenalty;
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
