"use client";

import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  TaxCalculator,
  MilitaryPayrollCalculator,
  TariffCalculator,
} from "@/engine/economy/economy-calculators";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { CountryRegistry } from "@/domain/data/countries";
import { DemographicsCalculator } from "@/domain/nation/demographics-calculator.utility";

export interface HumanResourceMetrics {
  nation: Nation | null;
  treasury: number;
  netIncomePerTurn: number;
  population: number;
  maxPopulationCapacity: number;
  capacityPercentage: number;
  perCapitaProductivity: number;
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
        population: 0,
        maxPopulationCapacity: 100000000,
        capacityPercentage: 0,
        perCapitaProductivity: 5000,
        stability: 0,
        currentTurn: gameState.currentTurn,
      };
    }

    const taxResult = TaxCalculator.evaluateTaxPolicy(nation);
    const payrollBreakdown = MilitaryPayrollCalculator.calculatePayroll(nation);
    const tariffResult = TariffCalculator.calculateTariffEffects(
      nation,
      gameState.nations,
    );

    const totalIncome = taxResult.taxIncome + tariffResult.tariffRevenue;
    const totalExpenses =
      payrollBreakdown.total + Math.floor(nation.nationalDebt * 0.05);
    const netIncome = totalIncome - totalExpenses;

    const demoMetrics = DemographicsCalculator.getMetrics(
      nation.population,
      nation.maxPopulationCapacity,
    );

    return {
      nation,
      treasury: nation.treasury,
      netIncomePerTurn: netIncome,
      population: nation.population,
      maxPopulationCapacity: demoMetrics.maxPopulationCapacity,
      capacityPercentage: demoMetrics.capacityPercentage,
      perCapitaProductivity: nation.perCapitaProductivity || 5000,
      stability: nation.government.stability,
      currentTurn: gameState.currentTurn,
    };
  }, [gameState]);
}
