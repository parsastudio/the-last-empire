"use client";

import { useBitPackedGame } from "@/presentation/hooks/game/final/use-bit-packed-game";

export function useGeopoliticsGame(customGameId?: string) {
  const activeGameId = customGameId || "default_game";
  return useBitPackedGame(activeGameId);
}
