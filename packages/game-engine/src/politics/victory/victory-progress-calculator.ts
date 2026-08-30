import { GameState } from "@/domain/game/game-state.schema";
import {
  CountryRegistry,
  NationGettersUtility,
  getNationGdp,
  GameStateMetricsUtility,
} from "@geopolitics/domain";

export interface VictoryProgressMetrics {
  territorySharePct: number;
  territoryTargetPct: number;
  territoryProgressPct: number;
  gdpSharePct: number;
  gdpTargetPct: number;
  gdpProgressPct: number;
}

export class VictoryProgressCalculator {
  public static calculateProgress(
    state: GameState | null,
    nationId: string,
  ): VictoryProgressMetrics {
    if (!state) {
      return {
        territorySharePct: 0,
        territoryTargetPct: 65,
        territoryProgressPct: 0,
        gdpSharePct: 0,
        gdpTargetPct: 65,
        gdpProgressPct: 0,
      };
    }

    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    const targetNation = state.nations[canonicalId] || state.nations[nationId];

    if (!targetNation) {
      return {
        territorySharePct: 0,
        territoryTargetPct: 65,
        territoryProgressPct: 0,
        gdpSharePct: 0,
        gdpTargetPct: 65,
        gdpProgressPct: 0,
      };
    }

    const totalWorldTerritory =
      GameStateMetricsUtility.getTotalWorldTerritoryPixels(state.provinces);
    const nationTerritory = NationGettersUtility.getTerritoryPixelCount(
      targetNation.id,
      state.provinces,
    );
    const territorySharePct =
      totalWorldTerritory > 0
        ? (nationTerritory / totalWorldTerritory) * 100
        : 0;
    const territoryProgressPct = Math.min(100, (territorySharePct / 65) * 100);

    const totalGlobalGdp = GameStateMetricsUtility.getTotalGlobalGdp(
      state.nations,
      state.provinces,
    );
    const nationGdp = getNationGdp(targetNation, state.provinces);
    const gdpSharePct =
      totalGlobalGdp > 0 ? (nationGdp / totalGlobalGdp) * 100 : 0;
    const gdpProgressPct = Math.min(100, (gdpSharePct / 65) * 100);

    return {
      territorySharePct: Number(territorySharePct.toFixed(1)),
      territoryTargetPct: 65,
      territoryProgressPct: Number(territoryProgressPct.toFixed(1)),
      gdpSharePct: Number(gdpSharePct.toFixed(1)),
      gdpTargetPct: 65,
      gdpProgressPct: Number(gdpProgressPct.toFixed(1)),
    };
  }
}
