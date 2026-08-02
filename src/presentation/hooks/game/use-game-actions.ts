"use client";

import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { GameAction } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useToast } from "@/presentation/context/toast-context";
import { ActionDispatcherService } from "@/presentation/services/action-dispatcher.service";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";
import { ActionRouter } from "@/engine/actions/action-router";

export function useGameActions(
  customGameId?: string,
  onActionExecuted?: () => void,
  currentState?: GameState | null,
) {
  const { showToast } = useToast();
  const params = useParams();

  const routeGameId = params?.gameId as string | undefined;

  const dispatcher = useMemo(() => new ActionDispatcherService(), []);
  const storageService = useMemo(() => new ClientStorageService(), []);
  const actionRouter = useMemo(() => new ActionRouter(), []);

  const dispatchAction = useCallback(
    async (action: GameAction, onSuccessMessage?: string): Promise<boolean> => {
      const activeGameId =
        customGameId ||
        routeGameId ||
        currentState?.gameId ||
        action.nationId ||
        "default_game";

      let effectiveState: GameState | null = currentState || null;

      if (!effectiveState) {
        effectiveState = await storageService.loadGameState(activeGameId);
      }

      if (!effectiveState) {
        effectiveState = await storageService.loadGameState("active_game");
      }

      if (effectiveState) {
        try {
          const optimisticState = actionRouter.route(effectiveState, action);
          await storageService.saveGameState(activeGameId, optimisticState);
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("geopolitics-state-updated", {
                detail: optimisticState,
              }),
            );
          }
          effectiveState = optimisticState;
        } catch {}
      }

      const result = await dispatcher.dispatch(
        action,
        activeGameId,
        effectiveState,
      );

      if (result.success) {
        if (result.newState) {
          await storageService.saveGameState(activeGameId, result.newState);
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("geopolitics-state-updated", {
                detail: result.newState,
              }),
            );
          }
        }

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
    [
      customGameId,
      routeGameId,
      currentState,
      dispatcher,
      storageService,
      actionRouter,
      showToast,
      onActionExecuted,
    ],
  );

  return { dispatchAction };
}
