"use client";

import { useMemo } from "react";
import { GameState, GameStateProjections } from "@geopolitics/domain";
import { useGameStore } from "@/presentation/stores/use-game-store";
import {
  selectHumanResourceMetrics,
  HumanResourceMetrics,
} from "@/presentation/selectors/resource-metrics.selector";

export type { HumanResourceMetrics };

export function useGameResources(
  overrideGameState?: GameState | null,
  projections?: GameStateProjections | null,
): HumanResourceMetrics {
  const storeGameState = useGameStore((state) => state.gameState);
  const gameState =
    overrideGameState !== undefined ? overrideGameState : storeGameState;

  return useMemo(
    () => selectHumanResourceMetrics(gameState, projections),
    [gameState, projections],
  );
}
