import { useCallback } from "react";
import type { GameAction } from "@/core/types/actions.types";
import type { Nation } from "@/core/types/nation.types";
import type { GovernmentType } from "@/core/types/government.types";

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
