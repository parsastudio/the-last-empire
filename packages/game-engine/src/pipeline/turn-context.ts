import {
  GameState,
  Nation,
  Province,
  CountryRegistry,
  getNationGdp,
  DIFFICULTY_CONFIGS,
} from "@geopolitics/domain";
import { GeopoliticalMatrixCache } from "@/engine/ai/geopolitical-matrix-cache";

export class TurnContext {
  public turn: number;
  public aliveNations: Nation[] = [];
  public aliveNationIds: Set<string> = new Set<string>();
  public rankMap: Map<string, number> = new Map<string, number>();
  public gdpMap: Map<string, number> = new Map<string, number>();
  public totalWorldGdp: number = 0;
  public provincesByOwnerMap: Map<string, Province[]> = new Map<
    string,
    Province[]
  >();
  public matrixCache!: GeopoliticalMatrixCache;
  public aiRevenueMultiplier: number = 1.4;

  constructor(state: GameState) {
    this.turn = state.currentTurn;
    const difficultyKey = state.difficulty ?? "NORMAL";
    this.aiRevenueMultiplier =
      DIFFICULTY_CONFIGS[difficultyKey]?.aiRevenueMultiplier ?? 1.4;
    this.sync(state);
  }

  public sync(state: GameState): void {
    this.turn = state.currentTurn;
    this.matrixCache = GeopoliticalMatrixCache.build(
      state.nations,
      state.provinces,
    );

    this.rankMap = this.matrixCache.getRankMap();
    this.provincesByOwnerMap = this.matrixCache.getProvincesByOwnerMap();

    this.aliveNations = [];
    this.aliveNationIds.clear();
    this.gdpMap.clear();
    this.totalWorldGdp = 0;

    for (const nation of Object.values(state.nations)) {
      if (!nation.isAlive) continue;
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      this.aliveNations.push(nation);
      this.aliveNationIds.add(canonicalId);

      const ownedProvinces = this.provincesByOwnerMap.get(canonicalId) || [];
      const nationGdp = getNationGdp(
        nation,
        undefined,
        ownedProvinces,
        this.provincesByOwnerMap,
      );

      this.gdpMap.set(canonicalId, nationGdp);
      this.gdpMap.set(nation.id, nationGdp);
      this.totalWorldGdp += nationGdp;
    }
  }

  public getNationGdp(nationId: string): number {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    return this.gdpMap.get(canonicalId) ?? this.gdpMap.get(nationId) ?? 0;
  }

  public getOwnedProvinces(nationId: string): Province[] {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    return (
      this.provincesByOwnerMap.get(canonicalId) ??
      this.provincesByOwnerMap.get(nationId) ??
      []
    );
  }

  public isAlive(nationId: string): boolean {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    return this.aliveNationIds.has(canonicalId);
  }

  public static create(state: GameState): TurnContext {
    return new TurnContext(state);
  }
}
