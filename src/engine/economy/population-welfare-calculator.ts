import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { Nation } from "@/domain/nation/nation.schema";
import { ResourceGenerationStep } from "@/engine/pipeline/economy/resource-generation.step";

export interface PopulationWelfareMetrics {
  oilDemand: number;
  steelDemand: number;
  oilFulfillment: number;
  steelFulfillment: number;
  oilStabilityImpact: number;
  steelStabilityImpact: number;
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
      Math.ceil((population / 20000000) * gdpFactor),
    );
    const discount = DoctrinesManager.getOilDemandDiscount(unlockedDoctrines);
    return Math.max(1, Math.ceil(baseDemand * discount));
  }

  public static calculateSteelDemand(
    population: number,
    gdp = 10000000000,
  ): number {
    if (population <= 0) return 0;
    const gdpFactor = Math.max(1, Math.floor(gdp / 15000000000));
    return Math.max(1, Math.ceil((population / 30000000) * gdpFactor));
  }

  public static calculateFulfillment(stock: number, demand: number): number {
    if (demand <= 0) return 1;
    if (stock <= 0) return 0;
    return Math.min(1, stock / demand);
  }

  public static calculateResourceStabilityImpact(fulfillment: number): number {
    const clamped = Math.max(0, Math.min(1, fulfillment));
    const impact = clamped * 2 - 1;
    return Number(impact.toFixed(2));
  }

  public static calculateEffectiveResources(nation: Nation): {
    effectiveOil: number;
    effectiveSteel: number;
  } {
    const { oilProducedPerTurn, steelProducedPerTurn } =
      ResourceGenerationStep.calculateResourceGeneration(nation);

    const oilDemand = PopulationWelfareCalculator.calculateOilDemand(
      nation.population,
      nation.gdp,
      nation.doctrines?.unlockedDoctrines,
    );
    const steelDemand = PopulationWelfareCalculator.calculateSteelDemand(
      nation.population,
      nation.gdp,
    );

    const autoTrade = nation.autoTradeSettings;
    const isAutoBuy = autoTrade?.autoBuyDeficit ?? false;

    let effectiveOil = nation.resources.oil + oilProducedPerTurn;
    let effectiveSteel = nation.resources.steel + steelProducedPerTurn;

    if (isAutoBuy && nation.isAlive) {
      effectiveOil = Math.max(oilDemand, effectiveOil);
      effectiveSteel = Math.max(steelDemand, effectiveSteel);
    }

    return { effectiveOil, effectiveSteel };
  }

  public static evaluateWelfareForNation(
    nation: Nation,
  ): PopulationWelfareMetrics {
    const { effectiveOil, effectiveSteel } =
      PopulationWelfareCalculator.calculateEffectiveResources(nation);

    return PopulationWelfareCalculator.evaluateWelfare(
      nation.population,
      effectiveOil,
      effectiveSteel,
      nation.gdp,
      nation.doctrines?.unlockedDoctrines,
    );
  }

  public static evaluateWelfare(
    population: number,
    oilStock: number,
    steelStock: number,
    gdp = 10000000000,
    unlockedDoctrines?: string[],
  ): PopulationWelfareMetrics {
    const oilDemand = PopulationWelfareCalculator.calculateOilDemand(
      population,
      gdp,
      unlockedDoctrines,
    );
    const steelDemand = PopulationWelfareCalculator.calculateSteelDemand(
      population,
      gdp,
    );

    const oilFulfillment = PopulationWelfareCalculator.calculateFulfillment(
      oilStock,
      oilDemand,
    );
    const steelFulfillment = PopulationWelfareCalculator.calculateFulfillment(
      steelStock,
      steelDemand,
    );

    const oilStabilityImpact =
      PopulationWelfareCalculator.calculateResourceStabilityImpact(
        oilFulfillment,
      );
    const steelStabilityImpact =
      PopulationWelfareCalculator.calculateResourceStabilityImpact(
        steelFulfillment,
      );

    const totalStabilityImpact = Number(
      (oilStabilityImpact + steelStabilityImpact).toFixed(2),
    );

    return {
      oilDemand,
      steelDemand,
      oilFulfillment,
      steelFulfillment,
      oilStabilityImpact,
      steelStabilityImpact,
      totalStabilityImpact,
    };
  }
}
