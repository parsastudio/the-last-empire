import { EconomyStep, EconomyStepContext } from "./economy-step.interface";

export class ResourceGenerationStep implements EconomyStep {
  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const isOilRich = nation.traits.includes("OIL_RICH");
      const isIndustrialHub = nation.traits.includes("INDUSTRIAL_HUB");
      const territoryFactor = Math.floor(nation.geography.territorySize / 1000);

      const oilIncome = isOilRich
        ? 300 + territoryFactor * 25
        : Math.max(10, territoryFactor * 5);

      const steelIncome = isIndustrialHub
        ? 150 + territoryFactor * 15
        : Math.max(10, territoryFactor * 5);

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
