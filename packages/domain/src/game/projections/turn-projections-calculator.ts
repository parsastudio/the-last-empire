import { GameState } from "@/domain/game/game-state.schema";
import { GameStateProjections } from "@/domain/game/projections/game-state-projections.schema";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationRankCandidateInput } from "@/domain/nation/getters/rank/nation-power-score-evaluator";
import { NationRankCalculatorUtility } from "@/domain/nation/getters/nation-rank-calculator.utility";
import { NationalBudgetCalculator } from "@/domain/economy/national-budget-calculator";
import { CountryRegistry } from "@/domain/data/countries/country-registry";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";
import { FiscalRevenueCalculator } from "@/domain/economy/fiscal-revenue-calculator";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { TerritoryIndustrialCapacity } from "@/domain/nation/getters/nation-territory-resolver.utility";
import { NationalBudgetBreakdown } from "@/domain/economy/national-budget-calculator";

export class TurnProjectionsCalculator {
  public static calculate(
    gameState: GameState | null | undefined,
  ): GameStateProjections {
    const gdpMap = new Map<string, number>();
    const capacityMap = new Map<string, TerritoryIndustrialCapacity>();
    const populationMap = new Map<string, number>();
    const budgetMap = new Map<string, NationalBudgetBreakdown>();

    if (!gameState || !gameState.nations) {
      return {
        gdpMap,
        rankMap: new Map<string, number>(),
        gdpRankMap: new Map<string, number>(),
        budgetMap,
        capacityMap,
        provincesByOwnerMap: new Map<string, ProvinceDynamicState[]>(),
        populationMap,
        totalWorldGdp: 0,
        totalWorldTerritoryPixels: 0,
      };
    }

    const provincesByOwnerMap = NationGettersUtility.buildProvincesByOwnerMap(
      gameState.provinces ?? {},
    );

    const aliveNations = Object.values(gameState.nations).filter(
      (n) => n.isAlive,
    );
    const rankCandidates: NationRankCandidateInput[] = [];
    const gdpCandidateList: { id: string; canonicalId: string; gdp: number }[] =
      [];

    let totalWorldGdp = 0;
    let totalWorldTerritoryPixels = 0;

    for (let i = 0; i < aliveNations.length; i++) {
      const nation = aliveNations[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      const ownedProvinces =
        provincesByOwnerMap.get(canonicalId) ??
        provincesByOwnerMap.get(nation.id) ??
        [];

      const capacity = NationGettersUtility.getTerritoryIndustrialCapacity(
        nation.id,
        undefined,
        ownedProvinces,
        provincesByOwnerMap,
      );
      capacityMap.set(canonicalId, capacity);
      capacityMap.set(nation.id, capacity);

      const nationGdp = getNationGdp(
        nation,
        undefined,
        ownedProvinces,
        provincesByOwnerMap,
      );
      gdpMap.set(canonicalId, nationGdp);
      gdpMap.set(nation.id, nationGdp);
      totalWorldGdp += nationGdp;

      let population = 0;
      let territoryPixels = 0;
      for (let p = 0; p < ownedProvinces.length; p++) {
        const prov = ownedProvinces[p]!;
        population += MapTopologyRegistry.getPopulation(prov.provinceId, 0);
        territoryPixels += MapTopologyRegistry.getPixelCount(
          prov.provinceId,
          0,
        );
      }
      populationMap.set(canonicalId, population);
      populationMap.set(nation.id, population);
      totalWorldTerritoryPixels += territoryPixels;

      rankCandidates.push({
        id: nation.id,
        gdp: nationGdp,
        population,
        military: nation.military,
        navalFleet: nation.navalFleet,
        stability: nation.government.stability,
        globalReputation: nation.globalReputation,
      });

      gdpCandidateList.push({
        id: nation.id,
        canonicalId,
        gdp: nationGdp,
      });
    }

    const rankMap =
      NationRankCalculatorUtility.calculateRankMapFromCandidates(
        rankCandidates,
      );

    const gdpRankMap = new Map<string, number>();
    gdpCandidateList.sort((a, b) => {
      if (b.gdp !== a.gdp) {
        return b.gdp - a.gdp;
      }
      return a.canonicalId.localeCompare(b.canonicalId);
    });

    for (let i = 0; i < gdpCandidateList.length; i++) {
      const item = gdpCandidateList[i]!;
      const rankValue = i + 1;
      gdpRankMap.set(item.canonicalId, rankValue);
      gdpRankMap.set(item.id, rankValue);
    }

    for (let i = 0; i < aliveNations.length; i++) {
      const nation = aliveNations[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      const budget = NationalBudgetCalculator.calculate(
        nation,
        gameState.nations,
        gameState.provinces,
        nation.treasury,
        FiscalRevenueCalculator.DEFAULT_AI_REVENUE_MULTIPLIER,
        gdpMap,
        totalWorldGdp,
      );
      budgetMap.set(canonicalId, budget);
      budgetMap.set(nation.id, budget);
    }

    return {
      gdpMap,
      rankMap,
      gdpRankMap,
      budgetMap,
      capacityMap,
      provincesByOwnerMap,
      populationMap,
      totalWorldGdp,
      totalWorldTerritoryPixels,
    };
  }
}
