import { useCallback } from "react";
import { GameAction } from "@/domain/game/action.schema";

export function useLocalMarketTrade(
  playerNationId: string | null,
  dispatchAction: (action: GameAction) => void,
) {
  const buyResource = useCallback(
    (resourceType: "oil" | "steel", amount: number) => {
      if (!playerNationId) {
        return;
      }
      dispatchAction({
        id: `trade-buy-${Date.now()}`,
        nationId: playerNationId,
        type: "TRADE_RESOURCES",
        resourceType,
        isBuy: true,
        amount,
      });
    },
    [playerNationId, dispatchAction],
  );

  return {
    buyResource,
  };
}
