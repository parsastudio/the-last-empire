"use client";

import { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { GameAction } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useToast } from "@/presentation/context/toast-context";
import { ActionDispatcherService } from "@/presentation/services/action-dispatcher.service";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";

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
  const storageService = useMemo(() => new ClientStorageService(), []);

  const dispatchAction = useCallback(
    async (action: GameAction, onSuccessMessage?: string): Promise<boolean> => {
      const result = await dispatcher.dispatch(
        action,
        activeGameId,
        currentState,
      );

      if (result.success) {
        if (result.newState) {
          if (activeGameId) {
            storageService.saveGameState(activeGameId, result.newState);
          }
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
      dispatcher,
      activeGameId,
      currentState,
      storageService,
      showToast,
      onActionExecuted,
    ],
  );

  return { dispatchAction };
}
