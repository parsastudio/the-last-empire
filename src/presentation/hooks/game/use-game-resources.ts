"use client";

import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { TaxCalculator } from "@/engine/economy/tax-calculator";
import { UpkeepCalculator } from "@/engine/economy/upkeep-calculator";
import { TradeRouteManager } from "@/engine/economy/trade-route-manager";
import { TariffCalculator } from "@/engine/economy/tariff-calculator";

export interface HumanResourceMetrics {
  nation: Nation | null;
  treasury: number;
  netIncomePerTurn: number;
  oil: number;
  oilRequiredPerTurn: number;
  steel: number;
  manpower: number;
  stability: number;
  corruption: number;
  currentTurn: number;
  pendingDecisionsCount: number;
}

const taxCalculator = new TaxCalculator();
const upkeepCalculator = new UpkeepCalculator();
const tradeRouteManager = new TradeRouteManager();
const tariffCalculator = new TariffCalculator();

export function useGameResources(
  gameState: GameState | null,
): HumanResourceMetrics {
  return useMemo(() => {
    if (!gameState || !gameState.humanNationId) {
      return {
        nation: null,
        treasury: 0,
        netIncomePerTurn: 0,
        oil: 0,
        oilRequiredPerTurn: 0,
        steel: 0,
        manpower: 0,
        stability: 0,
        corruption: 0,
        currentTurn: 1,
        pendingDecisionsCount: 0,
      };
    }

    const humanId = gameState.humanNationId;
    let nation = gameState.nations[humanId] || null;

    if (!nation) {
      const matchKey = Object.keys(gameState.nations).find(
        (key) =>
          key.toUpperCase() === humanId.toUpperCase() ||
          gameState.nations[key]?.name === humanId,
      );
      if (matchKey) {
        nation = gameState.nations[matchKey] || null;
      }
    }

    if (!nation) {
      return {
        nation: null,
        treasury: 0,
        netIncomePerTurn: 0,
        oil: 0,
        oilRequiredPerTurn: 0,
        steel: 0,
        manpower: 0,
        stability: 0,
        corruption: 0,
        currentTurn: gameState.currentTurn,
        pendingDecisionsCount: 0,
      };
    }

    const taxResult = taxCalculator.evaluateTaxPolicy(nation);
    const upkeepBreakdown = upkeepCalculator.calculateUpkeep(nation);
    const tradeRevenue = tradeRouteManager.calculateTotalTradeRevenue(
      nation,
      gameState.nations,
    );
    const tariffResult = tariffCalculator.calculateTariffEffects(
      nation,
      tradeRevenue,
    );

    const totalIncome =
      taxResult.taxIncome + tradeRevenue + tariffResult.tariffRevenue;
    const totalExpenses =
      upkeepBreakdown.total + Math.floor(nation.nationalDebt * 0.003);
    const netIncome = totalIncome - totalExpenses;

    const oilRequired = Math.ceil(
      (nation.military.airForce + nation.military.droneMissile) * 0.5,
    );

    let pendingCount = 0;
    if (nation.doctrines.doctrinePoints >= 3) pendingCount++;
    if (nation.recruitmentQueue.length === 0) pendingCount++;
    if (nation.resources.oil < oilRequired) pendingCount++;
    if (nation.government.stability < 35) pendingCount++;

    return {
      nation,
      treasury: nation.treasury,
      netIncomePerTurn: netIncome,
      oil: nation.resources.oil,
      oilRequiredPerTurn: oilRequired,
      steel: nation.resources.steel,
      manpower: nation.resources.manpower,
      stability: nation.government.stability,
      corruption: nation.government.corruption,
      currentTurn: gameState.currentTurn,
      pendingDecisionsCount: pendingCount,
    };
  }, [gameState]);
}
