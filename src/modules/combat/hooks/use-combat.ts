import { useCallback } from "react";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import type { Nation } from "@/modules/nation/schemas/nation.schema";

export function useCombat(
  nation: Nation | undefined,
  dispatch: (action: GameAction) => void,
) {
  const sendAttack = useCallback(
    (
      targetNationId: string,
      infantry: number,
      airForce: number,
      navy: number,
      droneMissile: number,
    ) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `attack-${Date.now()}`,
        nationId: nation.id,
        type: "ATTACK",
        targetNationId,
        infantry,
        airForce,
        navy,
        droneMissile,
      });
    },
    [nation, dispatch],
  );

  return {
    sendAttack,
  };
}
