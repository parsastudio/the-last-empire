import React from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { CountryStatusIndicator } from "./country-status-indicator";

interface StatusIndicatorOverlayProps {
  gameState: GameState;
  playerNationId: string | null;
}

export function StatusIndicatorOverlay({
  gameState,
  playerNationId,
}: StatusIndicatorOverlayProps) {
  if (!playerNationId) {
    return null;
  }
  return (
    <CountryStatusIndicator state={gameState} humanNationId={playerNationId} />
  );
}
