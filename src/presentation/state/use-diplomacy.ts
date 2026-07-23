import { useCallback } from "react";
import type { GameAction } from "@/domain/game/action.schema";
import type { Nation } from "@/domain/nation/nation.schema";
import type { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";

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

  const fundProxyInfluence = useCallback(
    (targetNationId: string, budget: number) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `proxy-fund-${Date.now()}`,
        nationId: nation.id,
        type: "FUND_PROXY_INFLUENCE",
        targetNationId,
        budget,
      });
    },
    [nation, dispatch],
  );

  const unlockDoctrine = useCallback(
    (doctrineId: string) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `unlock-${Date.now()}`,
        nationId: nation.id,
        type: "UNLOCK_DOCTRINE",
        doctrineId,
      });
    },
    [nation, dispatch],
  );

  const requestLoan = useCallback(
    (amount: number) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `loan-${Date.now()}`,
        nationId: nation.id,
        type: "REQUEST_LOAN",
        amount,
      });
    },
    [nation, dispatch],
  );

  return {
    proposeTreaty,
    declareWar,
    fundProxyInfluence,
    unlockDoctrine,
    requestLoan,
  };
}
