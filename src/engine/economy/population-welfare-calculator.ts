import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { Nation } from "@/domain/nation/nation.schema";
import { ResourceGenerationStep } from "@/engine/pipeline/economy/resource-generation.step";

export interface PopulationWelfareMetrics {
  oilDemand: number;
  oilFulfillment: number;
  oilStabilityImpact: number;
  totalStabilityImpact: number;
}

export class PopulationWelfareCalculator {
  public static calculateOilDemand(
    population: number,
    gdp = 10000000000,
    unlockedDoctrines?: string[],
    industrialLevel = 1,
  ): number {
    if (population <= 0) return 0;

    const householdDemand = (population / 10000000) * 1.5;
    const industrialDemand = (gdp / 20000000000) * 1.0;
    const baseDemand = householdDemand + industrialDemand;

    const efficiencyFactor = Math.max(
      0.3,
      1.0 / (1.0 + 0.1 * Math.max(0, industrialLevel - 1)),
    );

    const discount = DoctrinesManager.getOilDemandDiscount(unlockedDoctrines);

    return Math.max(1, Math.ceil(baseDemand * efficiencyFactor * discount));
  }

  public static calculateFulfillment(stock: number, demand: number): number {
    if (demand <= 0) return 1;
    if (stock <= 0) return 0;
    return Math.min(1, stock / demand);
  }

  public static calculateResourceStabilityImpact(fulfillment: number): number {
    const clamped = Math.max(0, Math.min(1, fulfillment));
    const impact = (clamped * 2 - 1) * 1.5;
    return Number(impact.toFixed(2));
  }

  public static calculateEffectiveResources(nation: Nation): {
    effectiveOil: number;
  } {
    const { oilProducedPerTurn } =
      ResourceGenerationStep.calculateResourceGeneration(nation);

    const oilDemand = PopulationWelfareCalculator.calculateOilDemand(
      nation.population,
      nation.gdp,
      nation.doctrines?.unlockedDoctrines,
      nation.industrialLevel,
    );

    const autoTrade = nation.autoTradeSettings;
    const isAutoBuy = autoTrade?.autoBuyDeficit ?? false;

    let effectiveOil = nation.resources.oil + oilProducedPerTurn;

    if (isAutoBuy && nation.isAlive) {
      effectiveOil = Math.max(oilDemand, effectiveOil);
    }

    return { effectiveOil };
  }

  public static evaluateWelfareForNation(
    nation: Nation,
  ): PopulationWelfareMetrics {
    const { effectiveOil } =
      PopulationWelfareCalculator.calculateEffectiveResources(nation);

    return PopulationWelfareCalculator.evaluateWelfare(
      nation.population,
      effectiveOil,
      nation.gdp,
      nation.doctrines?.unlockedDoctrines,
      nation.industrialLevel,
    );
  }

  public static evaluateWelfare(
    population: number,
    oilStock: number,
    gdp = 10000000000,
    unlockedDoctrines?: string[],
    industrialLevel = 1,
  ): PopulationWelfareMetrics {
    const oilDemand = PopulationWelfareCalculator.calculateOilDemand(
      population,
      gdp,
      unlockedDoctrines,
      industrialLevel,
    );

    const oilFulfillment = PopulationWelfareCalculator.calculateFulfillment(
      oilStock,
      oilDemand,
    );

    const oilStabilityImpact =
      PopulationWelfareCalculator.calculateResourceStabilityImpact(
        oilFulfillment,
      );

    const totalStabilityImpact = Number(oilStabilityImpact.toFixed(2));

    return {
      oilDemand,
      oilFulfillment,
      oilStabilityImpact,
      totalStabilityImpact,
    };
  }

  public static consumeTurnResources(nation: Nation): {
    updatedNation: Nation;
    metrics: PopulationWelfareMetrics;
  } {
    const metrics = this.evaluateWelfareForNation(nation);
    const newOil = Math.max(0, nation.resources.oil - metrics.oilDemand);

    return {
      updatedNation: {
        ...nation,
        resources: {
          ...nation.resources,
          oil: newOil,
        },
      },
      metrics,
    };
  }
}
