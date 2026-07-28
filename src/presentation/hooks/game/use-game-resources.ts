"use client";

import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";

export interface HumanResourceMetrics {
  nation: Nation | null;
  treasury: number;
  netIncomePerTurn: number;
  oil: number;
  steel: number;
  manpower: number;
  stability: number;
  corruption: number;
  globalAggression: number;
  currentTurn: number;
  pendingDecisionsCount: number;
}

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
        steel: 0,
        manpower: 0,
        stability: 0,
        corruption: 0,
        globalAggression: 0,
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
        steel: 0,
        manpower: 0,
        stability: 0,
        corruption: 0,
        globalAggression: 0,
        currentTurn: gameState.currentTurn,
        pendingDecisionsCount: 0,
      };
    }

    const grossTax = Math.floor(nation.gdp * (nation.taxRate / 100));
    const corruptionLoss = Math.floor(
      grossTax * (nation.government.corruption / 100),
    );
    const netIncome = grossTax - corruptionLoss;

    let pendingCount = 0;
    if (nation.doctrines.doctrinePoints >= 3) pendingCount++;
    if (nation.recruitmentQueue.length === 0) pendingCount++;
    if (nation.resources.oil < 20) pendingCount++;

    return {
      nation,
      treasury: nation.treasury,
      netIncomePerTurn: netIncome,
      oil: nation.resources.oil,
      steel: nation.resources.steel,
      manpower: nation.resources.manpower,
      stability: nation.government.stability,
      corruption: nation.government.corruption,
      globalAggression: nation.globalAggression,
      currentTurn: gameState.currentTurn,
      pendingDecisionsCount: pendingCount,
    };
  }, [gameState]);
}
