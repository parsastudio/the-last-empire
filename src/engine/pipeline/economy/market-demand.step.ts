import { EconomyStep, EconomyStepContext } from "./economy-step.interface";

export class MarketDemandStep implements EconomyStep {
  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const nation of Object.values(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const gdpScale = Math.max(1, Math.floor(nation.gdp / 10000000000));
      const militaryOilDemand = Math.ceil(
        (nation.military.airForce + nation.military.droneMissile) * 0.1,
      );

      const oilDemand = Math.max(
        1,
        militaryOilDemand + Math.ceil(gdpScale * 0.5),
      );
      const steelDemand = Math.max(
        1,
        Math.ceil(nation.industrialLevel * 0.8 + gdpScale * 0.4),
      );

      context.totalOilDemand += oilDemand;
      context.totalSteelDemand += steelDemand;
    }
  }
}
