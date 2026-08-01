import {
  EconomyStep,
  EconomyStepContext,
} from "@/engine/pipeline/economy/economy-step.interface";
import { Nation } from "@/domain/nation/nation.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export class ResourceGenerationStep implements EconomyStep {
  private static doctrinesManager = new DoctrinesManager();

  public static calculateResourceGeneration(nation: Nation): {
    oilProducedPerTurn: number;
    steelProducedPerTurn: number;
  } {
    const isOilRich = nation.traits.includes("OIL_RICH");
    const gdpScale = Math.max(1, Math.floor((nation.gdp || 0) / 10000000000));
    const industrialMultiplier =
      1.0 + ((nation.industrialLevel || 1) - 1) * 0.25;

    const baseOilLots = isOilRich
      ? Math.max(3, gdpScale * 2)
      : Math.max(1, Math.floor(gdpScale * 0.5));
    const baseSteelLots = Math.max(1, Math.floor(gdpScale * 0.8));

    const steelBonus = this.doctrinesManager.getSteelProductionBonus(
      nation.doctrines?.unlockedDoctrines,
    );
    const oilBonus = this.doctrinesManager.getOilProductionBonus(
      nation.doctrines?.unlockedDoctrines,
    );

    const oilProducedPerTurn =
      Math.max(1, Math.ceil(baseOilLots * industrialMultiplier)) + oilBonus;
    const steelProducedPerTurn =
      Math.max(1, Math.ceil(baseSteelLots * industrialMultiplier)) + steelBonus;

    return { oilProducedPerTurn, steelProducedPerTurn };
  }

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      const { oilProducedPerTurn, steelProducedPerTurn } =
        ResourceGenerationStep.calculateResourceGeneration(nation);

      nations[id] = {
        ...nation,
        resources: {
          ...nation.resources,
          oil: nation.resources.oil + oilProducedPerTurn,
          steel: nation.resources.steel + steelProducedPerTurn,
        },
      };
    }
  }
}
