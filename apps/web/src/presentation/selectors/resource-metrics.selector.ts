import {
  GameState,
  Nation,
  CountryRegistry,
  GameDifficulty,
  NationGettersUtility,
  NationalBudgetCalculator,
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
  const nation =
    gameState.nations[canonicalHumanId] || gameState.nations[humanId] || null;

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

  const capacity = NationGettersUtility.getTerritoryIndustrialCapacity(
    canonicalHumanId,
    gameState.provinces,
  );

  const budget = NationalBudgetCalculator.calculate(
    nation,
    gameState.nations,
    gameState.provinces,
    nation.treasury,
    1.0,
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
