import {
  GameState,
  Nation,
  getNationGdp,
  SecurityFeeCalculatorUtility,
  NAVAL_FLEET_CONFIG,
  DebtCalculatorUtility,
  CountryRegistry,
} from "@geopolitics/domain";
import {
  FiscalRevenueCalculator,
  MilitaryPayrollCalculator,
} from "@geopolitics/game-engine";

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
    };
  }

  let totalActiveFactories = 0;
  let totalMaxSlots = 0;
  for (const p of Object.values(gameState.provinces || {})) {
    if (
      CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalHumanId
    ) {
      totalActiveFactories += p.factoriesCount;
      totalMaxSlots += p.maxSlots;
    }
  }

  const fiscalResult = FiscalRevenueCalculator.calculate(
    nation,
    gameState.nations,
    gameState.provinces,
  );
  const payrollBreakdown = MilitaryPayrollCalculator.calculatePayroll(nation);

  const navalSecurityIncome = Math.floor(
    (nation.navalFleet || 0) *
      NAVAL_FLEET_CONFIG.FLEET_UNIT_COST *
      NAVAL_FLEET_CONFIG.TURN_REVENUE_RATE,
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
          const subsidy = Math.floor(partnerGdp * 0.005);
          if (partner.treasury >= subsidy && subsidy > 0) {
            warSubsidiesIncome += subsidy;
          }
        }
      }
    }
  }

  const totalGrossIncome =
    fiscalResult.totalRevenue + navalSecurityIncome + warSubsidiesIncome;

  const humanGdp = getNationGdp(nation, gameState.provinces);
  const securityFee = nation.securityGuarantorId
    ? SecurityFeeCalculatorUtility.calculateSecurityFee(
        humanGdp,
        Boolean(nation.isEmergencyProtectorate),
      )
    : 0;

  const totalExpenses =
    payrollBreakdown.total +
    securityFee +
    DebtCalculatorUtility.calculateInterest(nation.nationalDebt);
  const netIncome = totalGrossIncome - totalExpenses;

  return {
    nation,
    treasury: nation.treasury,
    netIncomePerTurn: netIncome,
    grossIncomePerTurn: totalGrossIncome,
    totalActiveFactories,
    totalMaxSlots,
    industrialLevel: nation.industrialLevel,
    equipmentTechLevel: nation.equipmentTechLevel,
    stability: nation.government.stability,
    currentTurn: gameState.currentTurn,
  };
}
