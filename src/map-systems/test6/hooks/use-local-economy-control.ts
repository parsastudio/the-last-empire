import { useCallback } from "react";
import { GameAction } from "@/domain/game/action.schema";

export function useLocalEconomyControl(
  playerNationId: string | null,
  dispatchAction: (action: GameAction) => void,
) {
  const updateTaxRate = useCallback(
    (newRate: number) => {
      if (!playerNationId) {
        return;
      }
      dispatchAction({
        id: `tax-set-local-${Date.now()}`,
        nationId: playerNationId,
        type: "SET_TAX_RATE",
        newRate,
      });
    },
    [playerNationId, dispatchAction],
  );

  return {
    updateTaxRate,
  };
}
