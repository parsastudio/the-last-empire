import { useState, useCallback } from "react";
import { GameState } from "@/domain/game/game-state.schema";

export function useTurnExecution(
  advanceNextTurn?: () => Promise<GameState | null>,
) {
  const [isProcessingTurn, setIsProcessingTurn] = useState<boolean>(false);

  const handleNextTurn = useCallback(async () => {
    if (isProcessingTurn || !advanceNextTurn) return;

    try {
      setIsProcessingTurn(true);
      await advanceNextTurn();
    } finally {
      setIsProcessingTurn(false);
    }
  }, [isProcessingTurn, advanceNextTurn]);

  return {
    isProcessingTurn,
    handleNextTurn,
  };
}
