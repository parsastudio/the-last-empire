import { useCallback } from "react";
import type { GameAction } from "@/core/types/actions.types";
import type { Nation } from "@/core/types/nation.types";
import type { DiplomaticProposalType } from "@/core/types/diplomacy.types";

export function useDiplomacy(
  nation: Nation | undefined,
  dispatch: (action: GameAction) => void,
) {
  const proposeTreaty = useCallback(
    (
      targetNationId: string,
      proposalType: DiplomaticProposalType,
      tributeAmount?: number,
    ) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `propose-${Date.now()}`,
        nationId: nation.id,
        type: "DIPLOMATIC_PROPOSAL",
        targetNationId,
        proposalType,
        tributeAmount,
      });
    },
    [nation, dispatch],
  );

  const declareWar = useCallback(
    (targetNationId: string) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `war-${Date.now()}`,
        nationId: nation.id,
        type: "DECLARE_WAR",
        targetNationId,
      });
    },
    [nation, dispatch],
  );

  return {
    proposeTreaty,
    declareWar,
  };
}
