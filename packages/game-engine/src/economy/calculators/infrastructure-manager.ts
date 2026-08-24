import { Nation } from "@/domain/nation/nation.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class DevelopmentManager {
  public static readonly COST_RATIO = 0.4;
  public static readonly CAPACITY_GROWTH_MULTIPLIER = 1.08;
  public static readonly PRODUCTIVITY_GROWTH_MULTIPLIER = 1.05;

  public static getUpgradeCost(gdpOrNation: number | Nation): number {
    const gdp =
      typeof gdpOrNation === "number" ? gdpOrNation : getNationGdp(gdpOrNation);
    return Math.max(1000000000, Math.floor(gdp * this.COST_RATIO));
  }

  public static calculateNextCapacity(currentCapacity: number): number {
    return Math.floor(currentCapacity * this.CAPACITY_GROWTH_MULTIPLIER);
  }

  public static calculateNextProductivity(currentProductivity: number): number {
    const prod = currentProductivity || 5000;
    return Math.max(
      100,
      Math.floor(prod * this.PRODUCTIVITY_GROWTH_MULTIPLIER),
    );
  }
}
