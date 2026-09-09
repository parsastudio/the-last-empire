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
    async (
      action: GameAction,
    ): Promise<{ success: boolean; resultData?: unknown }> => {
      if (isSubmitting) return { success: false };
      try {
        setIsSubmitting(true);
        const result = await dispatchStoreAction(action);

        if (result.success) {
          if (onActionExecuted) {
            onActionExecuted();
          }
          return { success: true, resultData: result.resultData };
        }

        showToast(
          "خطا در اجرای دستور",
          result.message || "امکان اجرای این دستور وجود ندارد.",
          "error",
        );
        return { success: false };
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "امکان اجرای این دستور وجود ندارد.";
        showToast("خطا در سیستم", errorMsg, "error");
        return { success: false };
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
