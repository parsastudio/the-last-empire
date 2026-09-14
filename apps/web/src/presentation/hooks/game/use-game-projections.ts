"use client";

import { useMemo } from "react";
import {
  GameState,
  GameStateProjections,
  TurnProjectionsCalculator,
} from "@geopolitics/domain";

export function useGameProjections(
  gameState: GameState | null | undefined,
): GameStateProjections {
  return useMemo(() => {
    return TurnProjectionsCalculator.calculate(gameState);
  }, [gameState]);
}
