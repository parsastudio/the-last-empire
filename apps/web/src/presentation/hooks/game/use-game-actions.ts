"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { GameAction } from "@/domain/game/action.schema";
import { useToast } from "@/presentation/context/toast-context";
import { useGameStore } from "@/presentation/stores/use-game-store";
import { ActionSoundResolverUtility } from "@/presentation/utils/action-sound-resolver.utility";

export function useGameActions(onActionExecuted?: () => void) {
  const tErrors = useTranslations("common.errors");
  const tCommon = useTranslations("common");
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
          ActionSoundResolverUtility.resolveAndPlay(action, result.resultData);

          if (onActionExecuted) {
            onActionExecuted();
          }
          return { success: true, resultData: result.resultData };
        }

        showToast(
          tErrors("actionFailedTitle"),
          result.message || tErrors("actionExecutionFailed"),
          "error",
        );
        return { success: false };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : tErrors("actionExecutionFailed");
        showToast(tCommon("systemError"), errorMsg, "error");
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      dispatchStoreAction,
      showToast,
      onActionExecuted,
      isSubmitting,
      tErrors,
      tCommon,
    ],
  );

  return {
    dispatchAction,
    isSubmitting,
  };
}
