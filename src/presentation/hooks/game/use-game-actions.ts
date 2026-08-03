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

      let latestLocalState: GameState | null = currentState || null;

      if (!latestLocalState) {
        latestLocalState = await storageService.loadGameState(activeGameId);
      }

      if (!latestLocalState) {
        showToast("خطا", "اطلاعات بازی یافت نشد.", "error");
        return false;
      }

      let newLocalState: GameState;
      try {
        newLocalState = actionRouter.route(latestLocalState, action);
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "امکان انجام این دستور وجود ندارد.";
        showToast("خطا در اجرای دستور", errorMsg, "error");
        return false;
      }

      await storageService.saveGameState(activeGameId, newLocalState);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("geopolitics-state-updated", {
            detail: newLocalState,
          }),
        );
      }

      if (onSuccessMessage) {
        showToast("دستور صادر شد", onSuccessMessage, "success");
      }
      if (onActionExecuted) {
        onActionExecuted();
      }

      dispatcher
        .dispatch(action, activeGameId, newLocalState)
        .then((result) => {
          if (!result.success) {
            showToast(
              "خطا در سرور",
              result.message || "دستور در سرور تایید نشد.",
              "error",
            );
          }
        })
        .catch(() => {});

      return true;
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
