import React from "react";
import { useRouter } from "next/navigation";
import { GameOverModal } from "./game-over-modal";
import { GameState } from "@/domain/game/game-state.schema";
import { useGameOverMetrics } from "./hooks/use-game-over-metrics";

interface GameOverDialogWrapperProps {
  gameState: GameState | null;
}

export function GameOverDialogWrapper({
  gameState,
}: GameOverDialogWrapperProps) {
  const router = useRouter();
  const metrics = useGameOverMetrics(gameState);

  if (!gameState || !gameState.isGameOver || !metrics) {
    return null;
  }

  return (
    <GameOverModal
      isOpen={gameState.isGameOver}
      isVictory={metrics.isVictory}
      winnerName={metrics.winnerName}
      reason={metrics.reasonText}
      turnsPlayed={metrics.turnsPlayed}
      finalGdp={metrics.finalGdp}
      finalPopulation={metrics.finalPopulation}
      conqueredArea={metrics.conqueredArea}
      onRestart={() => router.push("/select-nation")}
    />
  );
}
