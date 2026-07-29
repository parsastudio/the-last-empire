"use client";

import { useCallback } from "react";
import { useParams } from "next/navigation";
import { GameAction } from "@/domain/game/action.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { useToast } from "@/presentation/context/toast-context";

export function useGameActions(
  customGameId?: string,
  onActionExecuted?: () => void,
  currentState?: GameState | null,
) {
  const { showToast } = useToast();
  const params = useParams();

  const routeGameId = params?.gameId as string | undefined;
  const activeGameId = customGameId || routeGameId;

  const dispatchAction = useCallback(
    async (action: GameAction, onSuccessMessage?: string): Promise<boolean> => {
      try {
        const gameIdQuery = activeGameId ? `?gameId=${activeGameId}` : "";
        const res = await fetch(`/api/game/action${gameIdQuery}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, state: currentState }),
        });

        const json = await res.json();
        if (json.success) {
          if (onSuccessMessage) {
            showToast("دستور صادر شد", onSuccessMessage, "success");
          }
          if (onActionExecuted) {
            onActionExecuted();
          }
          return true;
        } else {
          showToast(
            "خطا در اجرای دستور",
            json.message || "امکان ثبت این اکشن وجود ندارد.",
            "error",
          );
          return false;
        }
      } catch {
        showToast("خطای شبکه", "ارتباط با سیستم مرکزی برقرار نشد.", "error");
        return false;
      }
    },
    [activeGameId, currentState, onActionExecuted, showToast],
  );

  return { dispatchAction };
}
