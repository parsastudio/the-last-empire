import { useCallback } from "react";
import { GameAction } from "@/domain/game/action.schema";

export function useLocalDoctrines(
  playerNationId: string | null,
  dispatchAction: (action: GameAction) => void,
) {
  const unlockDoctrineType = useCallback(
    (doctrineId: string) => {
      if (!playerNationId) {
        return;
      }
      dispatchAction({
        id: `doc-unlock-${Date.now()}`,
        nationId: playerNationId,
        type: "UNLOCK_DOCTRINE",
        doctrineId,
      });
    },
    [playerNationId, dispatchAction],
  );

  return {
    unlockDoctrineType,
  };
}
