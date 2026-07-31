import { EconomyStep, EconomyStepContext } from "./economy-step.interface";

export class ResourceGenerationStep implements EconomyStep {
  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const isOilRich = nation.traits.includes("OIL_RICH");
      const territoryFactor = Math.floor(nation.geography.territorySize / 1000);

      const baseOil = isOilRich
        ? 300 + territoryFactor * 25
        : Math.max(10, territoryFactor * 5);

      const baseSteel = Math.max(10, territoryFactor * 5);

      const industrialMultiplier = 1.0 + (nation.industrialLevel - 1) * 0.2;

      const oilIncome = Math.floor(baseOil * industrialMultiplier);
      const steelIncome = Math.floor(baseSteel * industrialMultiplier);

      nations[id] = {
        ...nation,
        resources: {
          ...nation.resources,
          oil: nation.resources.oil + oilIncome,
          steel: nation.resources.steel + steelIncome,
        },
      };
    }
  }
}
