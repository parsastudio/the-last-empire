import { useCallback } from "react";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { DiplomaticProposalType } from "@/modules/diplomacy/schemas/diplomacy.schema";

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
