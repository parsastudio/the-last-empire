"use client";

import { useState, useCallback } from "react";
import { GameAction } from "@/domain/game/action.schema";
import { useToast } from "@/presentation/context/toast-context";
import { useGameStore } from "@/presentation/stores/use-game-store";

export function useGameActions(onActionExecuted?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showToast } = useToast();
  const dispatchStoreAction = useGameStore((state) => state.dispatchAction);

  const dispatchAction = useCallback(
    async (action: GameAction, successMessage?: string): Promise<boolean> => {
      if (isSubmitting) return false;
      try {
        setIsSubmitting(true);
        const result = await dispatchStoreAction(action, successMessage);

        if (result.success) {
          if (successMessage) {
            showToast("دستور صادر شد", result.message, "success");
          }
          if (onActionExecuted) {
            onActionExecuted();
          }
          return true;
        }

        showToast("خطا در اجرای دستور", result.message, "error");
        return false;
      } catch {
        showToast("خطا در سیستم", "امکان اجرای این دستور وجود ندارد.", "error");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatchStoreAction, showToast, onActionExecuted, isSubmitting],
  );

  return {
    dispatchAction,
    isSubmitting,
  };
}
