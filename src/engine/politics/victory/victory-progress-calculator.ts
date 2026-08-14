import { GameState } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

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
        territoryTargetPct: 80,
        territoryProgressPct: 0,
        gdpSharePct: 0,
        gdpTargetPct: 60,
        gdpProgressPct: 0,
      };
    }

    const aliveNations = Object.values(state.nations).filter((n) => n.isAlive);
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    const targetNation = state.nations[nationId] || state.nations[canonicalId];

    if (!targetNation) {
      return {
        territorySharePct: 0,
        territoryTargetPct: 80,
        territoryProgressPct: 0,
        gdpSharePct: 0,
        gdpTargetPct: 60,
        gdpProgressPct: 0,
      };
    }

    const totalWorldTerritory = aliveNations.reduce(
      (sum, n) => sum + (n.geography?.territoryPixelCount || 0),
      0,
    );
    const nationTerritory = targetNation.geography?.territoryPixelCount || 0;
    const territorySharePct =
      totalWorldTerritory > 0
        ? (nationTerritory / totalWorldTerritory) * 100
        : 0;
    const territoryProgressPct = Math.min(100, (territorySharePct / 80) * 100);

    const totalGlobalGdp = aliveNations.reduce(
      (sum, n) => sum + getNationGdp(n),
      0,
    );
    const nationGdp = getNationGdp(targetNation);
    const gdpSharePct =
      totalGlobalGdp > 0 ? (nationGdp / totalGlobalGdp) * 100 : 0;
    const gdpProgressPct = Math.min(100, (gdpSharePct / 60) * 100);

    return {
      territorySharePct: Number(territorySharePct.toFixed(1)),
      territoryTargetPct: 80,
      territoryProgressPct: Number(territoryProgressPct.toFixed(1)),
      gdpSharePct: Number(gdpSharePct.toFixed(1)),
      gdpTargetPct: 60,
      gdpProgressPct: Number(gdpProgressPct.toFixed(1)),
    };
  }
}
