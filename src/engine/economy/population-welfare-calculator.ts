import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

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
  private doctrinesManager = new DoctrinesManager();

  public calculateOilDemand(
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
    const discount =
      this.doctrinesManager.getOilDemandDiscount(unlockedDoctrines);
    return Math.max(1, Math.ceil(baseDemand * discount));
  }

  public calculateSteelDemand(population: number, gdp = 10000000000): number {
    if (population <= 0) return 0;
    const gdpFactor = Math.max(1, Math.floor(gdp / 15000000000));
    return Math.max(1, Math.ceil((population / 30000000) * gdpFactor));
  }

  public calculateFulfillment(stock: number, demand: number): number {
    if (demand <= 0) return 1;
    if (stock <= 0) return 0;
    return Math.min(1, stock / demand);
  }

  public calculateResourceStabilityImpact(fulfillment: number): number {
    const clamped = Math.max(0, Math.min(1, fulfillment));
    const impact = clamped * 2 - 1;
    return Number(impact.toFixed(2));
  }

  public evaluateWelfare(
    population: number,
    oilStock: number,
    steelStock: number,
    gdp = 10000000000,
    unlockedDoctrines?: string[],
  ): PopulationWelfareMetrics {
    const oilDemand = this.calculateOilDemand(
      population,
      gdp,
      unlockedDoctrines,
    );
    const steelDemand = this.calculateSteelDemand(population, gdp);

    const oilFulfillment = this.calculateFulfillment(oilStock, oilDemand);
    const steelFulfillment = this.calculateFulfillment(steelStock, steelDemand);

    const oilStabilityImpact =
      this.calculateResourceStabilityImpact(oilFulfillment);
    const steelStabilityImpact =
      this.calculateResourceStabilityImpact(steelFulfillment);

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
