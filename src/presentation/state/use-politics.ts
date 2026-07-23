import { useCallback } from "react";
import type { GameAction } from "@/domain/game/action.schema";
import type { Nation } from "@/domain/nation/nation.schema";
import type { GovernmentType } from "@/domain/politics/politics.schema";

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
