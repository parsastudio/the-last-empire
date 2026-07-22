import { useCallback } from "react";
import type { GameAction } from "@/core/types/actions.types";
import type { Nation } from "@/core/types/nation.types";

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
