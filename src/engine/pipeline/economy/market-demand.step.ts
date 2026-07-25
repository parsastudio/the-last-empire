import { EconomyStep, EconomyStepContext } from "./economy-step.interface";

export class MarketDemandStep implements EconomyStep {
  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const nation of Object.values(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const oilDemand = Math.ceil(
        (nation.military.airForce + nation.military.droneMissile) * 0.5,
      );
      context.totalOilDemand += oilDemand;

      const steelDemand = nation.industrialLevel * 2;
      context.totalSteelDemand += steelDemand;
    }
  }
}
