import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GameOverModal } from "./game-over-modal";
import { GameState } from "@/domain/game/game-state.schema";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { useUiStore } from "@/presentation/stores/use-ui-store";
import { useGameOverMetrics } from "./game-over/hooks/use-game-over-metrics";

interface GameOverDialogWrapperProps {
  gameState: GameState | null;
}

export function GameOverDialogWrapper({
  gameState,
}: GameOverDialogWrapperProps) {
  const router = useRouter();
  const enableSandboxMode = useGameStore((state) => state.enableSandboxMode);
  const activeModal = useUiStore((state) => state.activeModal);
  const closeModal = useUiStore((state) => state.closeModal);
  const [isDismissed, setIsDismissed] = useState(false);

  const metrics = useGameOverMetrics(gameState);
  const isVictoryDebriefOpen = activeModal?.type === "VICTORY_DEBRIEF";

  if (!gameState || !gameState.isGameOver || !metrics) {
    return null;
  }

  const isModalOpen =
    isVictoryDebriefOpen || (!gameState.isSandboxMode && !isDismissed);

  const handleInspectOrContinue = () => {
    setIsDismissed(true);
    closeModal();
    void enableSandboxMode();
  };

  return (
    <GameOverModal
      isOpen={isModalOpen}
      isVictory={metrics.isVictory}
      winnerName={metrics.winnerName}
      winnerCode={metrics.winnerCode}
      winnerFlagCode={metrics.winnerFlagCode}
      reasonTitle={metrics.reasonTitle}
      reasonDescription={metrics.reasonDescription}
      turnsPlayed={metrics.turnsPlayed}
      finalGdp={metrics.finalGdp}
      finalPopulation={metrics.finalPopulation}
      conqueredPixels={metrics.conqueredPixels}
      onInspectOrContinue={handleInspectOrContinue}
      onRestart={() => router.push("/select-nation")}
      onHome={() => router.push("/")}
    />
  );
}
