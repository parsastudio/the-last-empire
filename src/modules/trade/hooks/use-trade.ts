import { useCallback } from "react";
import type { GameAction, Nation } from "@/core/types";

export function useTrade(
  nation: Nation | undefined,
  dispatch: (action: GameAction) => void,
) {
  const executeTrade = useCallback(
    (resourceType: "oil" | "steel", isBuy: boolean, amount: number) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `trade-${Date.now()}`,
        nationId: nation.id,
        type: "TRADE_RESOURCES",
        resourceType,
        isBuy,
        amount,
      });
    },
    [nation, dispatch],
  );

  return {
    executeTrade,
  };
}
