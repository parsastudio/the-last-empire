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
  public calculateOilDemand(population: number): number {
    if (population <= 0) return 0;
    return Math.ceil(population / 400000);
  }

  public calculateSteelDemand(population: number): number {
    if (population <= 0) return 0;
    return Math.ceil(population / 800000);
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
  ): PopulationWelfareMetrics {
    const oilDemand = this.calculateOilDemand(population);
    const steelDemand = this.calculateSteelDemand(population);

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
