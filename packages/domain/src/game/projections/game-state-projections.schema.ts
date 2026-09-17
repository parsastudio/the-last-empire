import { TerritoryIndustrialCapacity } from "@/domain/nation/getters/nation-territory-resolver.utility";
import { NationalBudgetBreakdown } from "@/domain/economy/national-budget-calculator";
import { ProvinceDynamicState } from "@/domain/province/province.schema";

export interface GameStateProjections {
  gdpMap: Map<string, number>;
  rankMap: Map<string, number>;
  gdpRankMap: Map<string, number>;
  budgetMap: Map<string, NationalBudgetBreakdown>;
  capacityMap: Map<string, TerritoryIndustrialCapacity>;
  provincesByOwnerMap: Map<string, ProvinceDynamicState[]>;
  populationMap: Map<string, number>;
  totalWorldGdp: number;
  totalWorldTerritoryPixels: number;
}
