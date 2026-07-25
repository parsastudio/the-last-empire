import { useCallback } from "react";
import { GameAction } from "@/domain/game/action.schema";
import { UnitType } from "@/domain/military/military.schema";

export function useLocalRecruitment(
  playerNationId: string | null,
  dispatchAction: (action: GameAction) => void,
) {
  const recruitUnits = useCallback(
    (unitType: UnitType, quantity: number) => {
      if (!playerNationId) {
        return;
      }
      dispatchAction({
        id: `recruit-local-${Date.now()}`,
        nationId: playerNationId,
        type: "RECRUIT_UNIT",
        unitType,
        quantity,
      });
    },
    [playerNationId, dispatchAction],
  );

  return {
    recruitUnits,
  };
}
