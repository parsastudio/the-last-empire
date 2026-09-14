import {
  GameState,
  Nation,
  GameDifficulty,
  NationGettersUtility,
  NationalBudgetCalculator,
  GameStateProjections,
  TurnProjectionsCalculator,
  CountryRegistry,
} from "@geopolitics/domain";

export interface HumanResourceMetrics {
  nation: Nation | null;
  treasury: number;
  netIncomePerTurn: number;
  grossIncomePerTurn: number;
  totalActiveFactories: number;
  totalMaxSlots: number;
  industrialLevel: number;
  equipmentTechLevel: number;
  stability: number;
  currentTurn: number;
  difficulty: GameDifficulty;
}

export function selectHumanResourceMetrics(
  gameState: GameState | null,
  projections?: GameStateProjections | null,
): HumanResourceMetrics {
  if (!gameState || !gameState.humanNationId) {
    return {
      nation: null,
      treasury: 0,
      netIncomePerTurn: 0,
      grossIncomePerTurn: 0,
      totalActiveFactories: 0,
      totalMaxSlots: 0,
      industrialLevel: 1.0,
      equipmentTechLevel: 1.0,
      stability: 0,
      currentTurn: 1,
      difficulty: "NORMAL",
    };
  }

  const humanId = gameState.humanNationId;
  const canonicalHumanId = CountryRegistry.resolveCanonicalId(humanId);
  const nation = NationGettersUtility.resolveNation(humanId, gameState.nations);

  if (!nation) {
    return {
      nation: null,
      treasury: 0,
      netIncomePerTurn: 0,
      grossIncomePerTurn: 0,
      totalActiveFactories: 0,
      totalMaxSlots: 0,
      industrialLevel: 1.0,
      equipmentTechLevel: 1.0,
      stability: 0,
      currentTurn: gameState.currentTurn,
      difficulty: gameState.difficulty ?? "NORMAL",
    };
  }

  const activeProjections =
    projections ?? TurnProjectionsCalculator.calculate(gameState);
  const capacity =
    activeProjections.capacityMap.get(canonicalHumanId) ??
    NationGettersUtility.getTerritoryIndustrialCapacity(
      nation.id,
      gameState.provinces,
    );

  const budget =
    activeProjections.budgetMap.get(canonicalHumanId) ??
    NationalBudgetCalculator.calculate(
      nation,
      gameState.nations,
      gameState.provinces,
      nation.treasury,
      1.0,
      activeProjections.gdpMap,
      activeProjections.totalWorldGdp,
    );

  return {
    nation,
    treasury: nation.treasury,
    netIncomePerTurn: budget.netIncome,
    grossIncomePerTurn: budget.grossRevenue,
    totalActiveFactories: capacity.totalActiveFactories,
    totalMaxSlots: capacity.totalMaxSlots,
    industrialLevel: nation.industrialLevel,
    equipmentTechLevel: nation.equipmentTechLevel,
    stability: nation.government.stability,
    currentTurn: gameState.currentTurn,
    difficulty: gameState.difficulty ?? "NORMAL",
  };
}
