import { EconomyStep, EconomyStepContext } from "./economy-step.interface";

export class ResourceGenerationStep implements EconomyStep {
  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const resourceIncomeFactor = Math.floor(
        nation.geography.territorySize / 1000,
      );
      if (resourceIncomeFactor > 0) {
        nations[id] = {
          ...nation,
          resources: {
            ...nation.resources,
            oil: nation.resources.oil + resourceIncomeFactor * 5,
            steel: nation.resources.steel + resourceIncomeFactor * 5,
          },
        };
      }
    }
  }
}
