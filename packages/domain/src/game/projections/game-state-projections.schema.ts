import { z } from "zod";
import { TerritoryIndustrialCapacity } from "@/domain/nation/getters/nation-territory-resolver.utility";
import { NationalBudgetBreakdown } from "@/domain/economy/national-budget-calculator";
import { ProvinceDynamicState } from "@/domain/province/province.schema";

export const GameStateProjectionsSchema = z.object({
  totalWorldGdp: z.number().nonnegative(),
  totalWorldTerritoryPixels: z.number().nonnegative(),
});

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
