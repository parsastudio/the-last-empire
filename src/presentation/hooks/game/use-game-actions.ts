import { useCallback, useMemo } from "react";
import { GameAction } from "@/domain/game/action.schema";
import { useToast } from "@/presentation/context/toast-context";
import { ActionDispatcherService } from "@/presentation/services/action-dispatcher.service";

export function useGameActions(
  customGameId?: string,
  onActionExecuted?: () => void,
) {
  const { showToast } = useToast();
  const dispatcher = useMemo(() => new ActionDispatcherService(), []);

  const dispatchAction = useCallback(
    async (action: GameAction, onSuccessMessage?: string): Promise<boolean> => {
      const result = await dispatcher.dispatch(action, customGameId);

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
    [customGameId, dispatcher, showToast, onActionExecuted],
  );

  return { dispatchAction };
}
