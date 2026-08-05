"use client";

import { useCallback, useMemo, useContext } from "react";
import { useParams } from "next/navigation";
import { GameAction } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useToast } from "@/presentation/context/toast-context";
import { ActionDispatcherService } from "@/presentation/services/action-dispatcher.service";
import { GameContext } from "@/presentation/context/game-context";

export function useGameActions(
  customGameId?: string,
  onActionExecuted?: (newState?: GameState) => void,
  currentState?: GameState | null,
) {
  const gameContext = useContext(GameContext);
  const { showToast } = useToast();
  const params = useParams();

  const routeGameId = params?.gameId as string | undefined;
  const dispatcher = useMemo(() => new ActionDispatcherService(), []);

  const dispatchAction = useCallback(
    async (action: GameAction, onSuccessMessage?: string): Promise<boolean> => {
      if (gameContext) {
        return gameContext.dispatchAction(action, onSuccessMessage);
      }

      const activeGameId =
        customGameId ||
        routeGameId ||
        currentState?.gameId ||
        action.nationId ||
        "default_game";

      const result = await dispatcher.dispatch(
        action,
        activeGameId,
        currentState,
      );

      if (result.success && result.newState) {
        if (onSuccessMessage) {
          showToast("دستور صادر شد", onSuccessMessage, "success");
        }
        if (onActionExecuted) {
          onActionExecuted(result.newState);
        }
        return true;
      }

      showToast(
        "خطا در اجرای دستور",
        result.message || "امکان انجام این دستور وجود ندارد.",
        "error",
      );
      return false;
    },
    [
      gameContext,
      customGameId,
      routeGameId,
      currentState,
      dispatcher,
      showToast,
      onActionExecuted,
    ],
  );

  return { dispatchAction };
}
