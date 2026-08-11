import { Nation } from "@/domain/nation/nation.schema";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export class ResourceGenerationStep {
  public static calculateResourceGeneration(nation: Nation): {
    oilProducedPerTurn: number;
  } {
    const gdpScale = Math.max(1, Math.floor((nation.gdp || 0) / 10000000000));
    const industrialMultiplier =
      1.0 + ((nation.industrialLevel || 1) - 1) * 0.25;

    const baseOilLots = Math.max(1, Math.floor(gdpScale * 1.5));

    const oilBonus = DoctrinesManager.getOilProductionBonus(
      nation.doctrines?.unlockedDoctrines,
    );

    const oilProducedPerTurn =
      Math.max(1, Math.ceil(baseOilLots * industrialMultiplier)) + oilBonus;

    return { oilProducedPerTurn };
  }
}
