"use client";

import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { GameAction } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useToast } from "@/presentation/context/toast-context";
import { ActionDispatcherService } from "@/presentation/services/action-dispatcher.service";

export function useGameActions(
  customGameId?: string,
  onActionExecuted?: () => void,
  currentState?: GameState | null,
) {
  const { showToast } = useToast();
  const params = useParams();

  const routeGameId = params?.gameId as string | undefined;
  const activeGameId = customGameId || routeGameId;

  const dispatcher = useMemo(() => new ActionDispatcherService(), []);

  const dispatchAction = useCallback(
    async (action: GameAction, onSuccessMessage?: string): Promise<boolean> => {
      const result = await dispatcher.dispatch(
        action,
        activeGameId,
        currentState,
      );

      if (result.success) {
        if (onSuccessMessage) {
          showToast("دستور صادر شد", onSuccessMessage, "success");
        }
        if (onActionExecuted) {
          onActionExecuted();
        }
        return true;
      }

      showToast(
        "خطا در اجرای دستور",
        result.message || "امکان ثبت این اکشن وجود ندارد.",
        "error",
      );
      return false;
    },
    [dispatcher, activeGameId, currentState, showToast, onActionExecuted],
  );

  return { dispatchAction };
}
