"use client";

import { useCallback } from "react";
import { GameAction } from "@/domain/game/action.schema";
import { useToast } from "@/presentation/context/toast-context";

export function useGameActions(
  customGameId?: string,
  onActionExecuted?: () => void,
) {
  const { showToast } = useToast();

  const dispatchAction = useCallback(
    async (action: GameAction, onSuccessMessage?: string): Promise<boolean> => {
      try {
        const gameIdQuery = customGameId ? `?gameId=${customGameId}` : "";
        const res = await fetch(`/api/game/action${gameIdQuery}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
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
    [customGameId, onActionExecuted, showToast],
  );

  return { dispatchAction };
}
