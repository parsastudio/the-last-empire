import { useCallback } from "react";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { GovernmentType } from "@/modules/politics/schemas/politics.schema";

export function usePolitics(
  nation: Nation | undefined,
  dispatch: (action: GameAction) => void,
) {
  const changeGovernment = useCallback(
    (newGovernment: GovernmentType) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `gov-change-${Date.now()}`,
        nationId: nation.id,
        type: "CHANGE_GOVERNMENT",
        newGovernment,
      });
    },
    [nation, dispatch],
  );

  const fundAntiCorruptionDrive = useCallback(
    (amount: number) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `anti-corruption-${Date.now()}`,
        nationId: nation.id,
        type: "ANTI_CORRUPTION_DRIVE",
        amount,
      });
    },
    [nation, dispatch],
  );

  return {
    changeGovernment,
    fundAntiCorruptionDrive,
  };
}
