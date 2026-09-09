import {
  GameState,
  Nation,
  Province,
  CountryRegistry,
  NationGettersUtility,
  getNationGdp,
  DIFFICULTY_CONFIGS,
} from "@geopolitics/domain";
import { GeopoliticalMatrixCache } from "@/engine/ai/geopolitical-matrix-cache";

export interface TurnContext {
  turn: number;
  aliveNations: Nation[];
  aliveNationIds: Set<string>;
  rankMap: Map<string, number>;
  gdpMap: Map<string, number>;
  totalWorldGdp: number;
  provincesByOwnerMap: Map<string, Province[]>;
  matrixCache: GeopoliticalMatrixCache;
  aiRevenueMultiplier: number;
}

export class TurnContextFactory {
  public static create(
    state: GameState,
    matrixCache?: GeopoliticalMatrixCache,
  ): TurnContext {
    const cache =
      matrixCache ??
      GeopoliticalMatrixCache.build(state.nations, state.provinces);

    const rankMap = cache.getRankMap();
    const provincesByOwnerMap = cache.getProvincesByOwnerMap();

    const aliveNations: Nation[] = [];
    const aliveNationIds = new Set<string>();
    const gdpMap = new Map<string, number>();
    let totalWorldGdp = 0;

    for (const nation of Object.values(state.nations)) {
      if (!nation.isAlive) continue;
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      aliveNations.push(nation);
      aliveNationIds.add(canonicalId);

      const ownedProvinces = provincesByOwnerMap.get(canonicalId) || [];
      const nationGdp = getNationGdp(
        nation,
        undefined,
        ownedProvinces,
        provincesByOwnerMap,
      );

      gdpMap.set(canonicalId, nationGdp);
      gdpMap.set(nation.id, nationGdp);
      totalWorldGdp += nationGdp;
    }

    const difficultyKey = state.difficulty ?? "NORMAL";
    const aiRevenueMultiplier =
      DIFFICULTY_CONFIGS[difficultyKey]?.aiRevenueMultiplier ?? 1.4;

    return {
      turn: state.currentTurn,
      aliveNations,
      aliveNationIds,
      rankMap,
      gdpMap,
      totalWorldGdp,
      provincesByOwnerMap,
      matrixCache: cache,
      aiRevenueMultiplier,
    };
  }
}
