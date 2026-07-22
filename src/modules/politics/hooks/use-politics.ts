import { useCallback } from "react";
import type { GameAction, Nation, GovernmentType } from "@/core/types";

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

  return {
    changeGovernment,
  };
}
