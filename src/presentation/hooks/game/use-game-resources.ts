"use client";

import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  TaxCalculator,
  MilitaryPayrollCalculator,
  TariffCalculator,
} from "@/engine/economy/economy-calculators";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { CountryRegistry } from "@/domain/data/countries";

export interface HumanResourceMetrics {
  nation: Nation | null;
  treasury: number;
  netIncomePerTurn: number;
  oil: number;
  oilRequiredPerTurn: number;
  stability: number;
  currentTurn: number;
}

export function useGameResources(
  overrideGameState?: GameState | null,
): HumanResourceMetrics {
  const storeGameState = useGameStore((state) => state.gameState);
  const gameState =
    overrideGameState !== undefined ? overrideGameState : storeGameState;

  return useMemo(() => {
    if (!gameState || !gameState.humanNationId) {
      return {
        nation: null,
        treasury: 0,
        netIncomePerTurn: 0,
        oil: 0,
        oilRequiredPerTurn: 0,
        stability: 0,
        currentTurn: 1,
      };
    }

    const humanId = gameState.humanNationId;
    const canonicalHumanId = CountryRegistry.resolveCanonicalId(humanId);
    const nation =
      gameState.nations[humanId] || gameState.nations[canonicalHumanId] || null;

    if (!nation) {
      return {
        nation: null,
        treasury: 0,
        netIncomePerTurn: 0,
        oil: 0,
        oilRequiredPerTurn: 0,
        stability: 0,
        currentTurn: gameState.currentTurn,
      };
    }

    const taxResult = TaxCalculator.evaluateTaxPolicy(nation);
    const payrollBreakdown = MilitaryPayrollCalculator.calculatePayroll(nation);
    const tariffResult = TariffCalculator.calculateTariffEffects(nation);

    const totalIncome = taxResult.taxIncome + tariffResult.tariffRevenue;
    const totalExpenses =
      payrollBreakdown.total + Math.floor(nation.nationalDebt * 0.003);
    const netIncome = totalIncome - totalExpenses;

    const welfareMetrics =
      PopulationWelfareCalculator.evaluateWelfareForNation(nation);

    return {
      nation,
      treasury: nation.treasury,
      netIncomePerTurn: netIncome,
      oil: nation.resources.oil,
      oilRequiredPerTurn: welfareMetrics.oilDemand,
      stability: nation.government.stability,
      currentTurn: gameState.currentTurn,
    };
  }, [gameState]);
}
