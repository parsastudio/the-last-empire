"use client";

import { useCallback } from "react";
import { GameAction } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useToast } from "@/presentation/context/toast-context";
import { useGameStore } from "@/presentation/stores/use-game-store";

export function useGameActions(
  _customGameId?: string,
  onActionExecuted?: (newState?: GameState) => void,
) {
  const { showToast } = useToast();
  const dispatchStoreAction = useGameStore((state) => state.dispatchAction);

  const dispatchAction = useCallback(
    async (action: GameAction, onSuccessMessage?: string): Promise<boolean> => {
      const result = await dispatchStoreAction(action, onSuccessMessage);

      if (result.success) {
        if (onSuccessMessage) {
          showToast("دستور صادر شد", result.message, "success");
        }
        if (onActionExecuted) {
          const currentGameState = useGameStore.getState().gameState;
          onActionExecuted(currentGameState ?? undefined);
        }
        return true;
      }

      showToast("خطا در اجرای دستور", result.message, "error");
      return false;
    },
    [dispatchStoreAction, showToast, onActionExecuted],
  );

  return { dispatchAction };
}
