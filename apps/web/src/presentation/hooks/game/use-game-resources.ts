"use client";

import { useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { useGameStore } from "@/presentation/stores/use-game-store";
import {
  selectHumanResourceMetrics,
  HumanResourceMetrics,
} from "@/presentation/selectors/resource-metrics.selector";

export type { HumanResourceMetrics };

export function useGameResources(
  overrideGameState?: GameState | null,
): HumanResourceMetrics {
  const storeGameState = useGameStore((state) => state.gameState);
  const gameState =
    overrideGameState !== undefined ? overrideGameState : storeGameState;

  return useMemo(() => selectHumanResourceMetrics(gameState), [gameState]);
}
