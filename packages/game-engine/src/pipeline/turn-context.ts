import {
  GameState,
  Nation,
  ProvinceDynamicState,
  CountryRegistry,
  getNationGdp,
  DIFFICULTY_CONFIGS,
  GlobalCoalition,
  DiplomacyLockManager,
  NationRelationResolver,
} from "@geopolitics/domain";
import { GeopoliticalMatrixCache } from "@/engine/ai/geopolitical-matrix-cache";
import { GeopoliticalVector } from "@/engine/ai/geopolitical-vector-calculator";
import { AIPosture } from "@/engine/ai/procurement/ai-posture-evaluator";

export class TurnContext {
  public readonly turn: number;
  public readonly state: GameState;
  public readonly aliveNations: Nation[] = [];
  public readonly aliveNationIds: Set<string> = new Set<string>();
  public readonly rankMap: Map<string, number>;
  public readonly gdpMap: Map<string, number> = new Map<string, number>();
  public totalWorldGdp = 0;
  public readonly provincesByOwnerMap: Map<string, ProvinceDynamicState[]>;
  public readonly matrixCache: GeopoliticalMatrixCache;
  public readonly aiRevenueMultiplier: number;
  public readonly lockedDiplomacyTargets: Set<string>;
  public readonly globalCoalition: GlobalCoalition | null;

  constructor(state: GameState, lockedDiplomacyTargets?: Set<string>) {
    this.turn = state.currentTurn;
    this.state = state;
    this.lockedDiplomacyTargets = lockedDiplomacyTargets ?? new Set<string>();
    this.globalCoalition = state.globalCoalition ?? null;

    const difficultyKey = state.difficulty ?? "NORMAL";
    this.aiRevenueMultiplier =
      DIFFICULTY_CONFIGS[difficultyKey]?.aiRevenueMultiplier ?? 1.4;

    this.matrixCache = GeopoliticalMatrixCache.build(
      state.nations,
      state.provinces,
    );

    this.rankMap = this.matrixCache.getRankMap();
    this.provincesByOwnerMap = this.matrixCache.getProvincesByOwnerMap();

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

  public static hasTerritorialOwnershipChange(
    prevState: GameState,
    nextState: GameState,
  ): boolean {
    if (prevState.provinces === nextState.provinces) return false;

    const prevKeys = Object.keys(prevState.provinces);
    const nextKeys = Object.keys(nextState.provinces);
    if (prevKeys.length !== nextKeys.length) return true;

    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i]!;
      const prevProv = prevState.provinces[key];
      const nextProv = nextState.provinces[key];
      if (!prevProv || !nextProv) return true;
      if (prevProv.ownerNationId !== nextProv.ownerNationId) return true;
    }

    return false;
  }

  public getNation(nationId: string): Nation | null {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    return (
      this.state.nations[canonicalId] || this.state.nations[nationId] || null
    );
  }

  public getNationGdp(nationId: string): number {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    return this.gdpMap.get(canonicalId) ?? this.gdpMap.get(nationId) ?? 0;
  }

  public getOwnedProvinces(nationId: string): ProvinceDynamicState[] {
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

  public isAtWar(nation: Nation): boolean {
    return NationRelationResolver.isAtWar(nation, this.state.nations);
  }

  public getRank(nationId: string): number {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    return this.rankMap.get(canonicalId) ?? this.rankMap.get(nationId) ?? 99;
  }

  public getReachableTargets(nation: Nation): Nation[] {
    return this.matrixCache.getReachableTargets(
      nation,
      this.state.nations,
      this.state.provinces,
    );
  }

  public getVectorsForNation(nation: Nation): Map<string, GeopoliticalVector> {
    return this.matrixCache.getVectorsForNation(
      nation,
      this.state.nations,
      this.state.provinces,
    );
  }

  public getVector(
    source: Nation,
    target: Nation,
  ): GeopoliticalVector | undefined {
    const targetCanonical = CountryRegistry.resolveCanonicalId(target.id);
    return this.getVectorsForNation(source).get(targetCanonical);
  }

  public getPosture(nation: Nation): AIPosture {
    return this.matrixCache.getPosture(
      nation,
      this.state.nations,
      this.state.provinces,
    );
  }

  public isDiplomacyLocked(targetId: string, sourceId: string): boolean {
    return DiplomacyLockManager.isLocked(
      this.lockedDiplomacyTargets,
      sourceId,
      targetId,
    );
  }

  public static create(
    state: GameState,
    lockedDiplomacyTargets?: Set<string>,
  ): TurnContext {
    return new TurnContext(state, lockedDiplomacyTargets);
  }
}
