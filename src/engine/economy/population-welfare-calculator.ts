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
  ): number {
    if (population <= 0) return 0;
    const gdpFactor = Math.max(1, Math.floor(gdp / 10000000000));
    const baseDemand = Math.max(
      1,
      Math.ceil((population / 10000000) * gdpFactor * 1.2),
    );
    const discount = DoctrinesManager.getOilDemandDiscount(unlockedDoctrines);
    return Math.max(1, Math.ceil(baseDemand * discount));
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
    );
  }

  public static evaluateWelfare(
    population: number,
    oilStock: number,
    gdp = 10000000000,
    unlockedDoctrines?: string[],
  ): PopulationWelfareMetrics {
    const oilDemand = PopulationWelfareCalculator.calculateOilDemand(
      population,
      gdp,
      unlockedDoctrines,
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
