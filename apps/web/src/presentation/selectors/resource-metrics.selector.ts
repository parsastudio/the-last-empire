import {
  GameState,
  Nation,
  NationGettersUtility,
  getNationGdp,
} from "@geopolitics/domain";
import {
  FiscalRevenueCalculator,
  MilitaryPayrollCalculator,
} from "@geopolitics/game-engine";
import { DemographicsCalculator } from "@/domain/nation/demographics-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";

export interface HumanResourceMetrics {
  nation: Nation | null;
  treasury: number;
  netIncomePerTurn: number;
  grossIncomePerTurn: number;
  population: number;
  maxPopulationCapacity: number;
  capacityPercentage: number;
  perCapitaProductivity: number;
  stability: number;
  currentTurn: number;
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
      population: 0,
      maxPopulationCapacity: 100000000,
      capacityPercentage: 0,
      perCapitaProductivity: 5000,
      stability: 0,
      currentTurn: 1,
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
      population: 0,
      maxPopulationCapacity: 100000000,
      capacityPercentage: 0,
      perCapitaProductivity: 5000,
      stability: 0,
      currentTurn: gameState.currentTurn,
    };
  }

  const population = NationGettersUtility.getPopulation(
    nation.id,
    gameState.provinces,
  );
  const maxCapacity = NationGettersUtility.getMaxPopulationCapacity(
    nation.id,
    gameState.provinces,
  );
  const productivity = NationGettersUtility.getPerCapitaProductivity(
    nation.id,
    gameState.provinces,
  );

  const fiscalResult = FiscalRevenueCalculator.calculate(
    nation,
    gameState.nations,
    gameState.provinces,
  );
  const payrollBreakdown = MilitaryPayrollCalculator.calculatePayroll(nation);

  const navalSecurityIncome = Math.floor(
    (nation.navalFleet || 0) * 50_000_000_000 * 0.06,
  );

  let warSubsidiesIncome = 0;
  const isAtWar = Object.values(nation.relations || {}).some(
    (r) => r.stance === "WAR",
  );

  if (isAtWar && gameState.nations) {
    for (const rel of Object.values(nation.relations || {})) {
      if (rel.stance === "STRATEGIC_PARTNERSHIP") {
        const partnerCanonical = CountryRegistry.resolveCanonicalId(
          rel.targetNationId,
        );
        const partner =
          gameState.nations[partnerCanonical] ||
          gameState.nations[rel.targetNationId];
        if (partner && partner.isAlive) {
          const partnerGdp = getNationGdp(partner, gameState.provinces);
          const subsidy = Math.floor(partnerGdp * 0.02);
          if (partner.treasury >= subsidy && subsidy > 0) {
            warSubsidiesIncome += subsidy;
          }
        }
      }
    }
  }

  const totalGrossIncome =
    fiscalResult.totalRevenue + navalSecurityIncome + warSubsidiesIncome;
  const totalExpenses =
    payrollBreakdown.total + Math.floor(nation.nationalDebt * 0.07);
  const netIncome = totalGrossIncome - totalExpenses;

  const demoMetrics = DemographicsCalculator.getMetrics(
    population,
    maxCapacity,
  );

  return {
    nation,
    treasury: nation.treasury,
    netIncomePerTurn: netIncome,
    grossIncomePerTurn: totalGrossIncome,
    population,
    maxPopulationCapacity: demoMetrics.maxPopulationCapacity,
    capacityPercentage: demoMetrics.capacityPercentage,
    perCapitaProductivity: productivity,
    stability: nation.government.stability,
    currentTurn: gameState.currentTurn,
  };
}
