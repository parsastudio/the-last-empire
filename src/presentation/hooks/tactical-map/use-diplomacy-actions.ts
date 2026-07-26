import { useCallback } from "react";
import { GameAction } from "@/domain/game/action.schema";
import { DiplomaticProposalType } from "@/domain/diplomacy/diplomacy.schema";

export function useDiplomacyActions(
  playerNationId: string | null,
  dispatchAction: (action: GameAction) => void,
) {
  const proposeDiplomacy = useCallback(
    (targetNationId: string, proposalType: DiplomaticProposalType) => {
      if (!playerNationId) {
        return;
      }
      dispatchAction({
        id: `diplo-prop-${Date.now()}`,
        nationId: playerNationId,
        type: "DIPLOMATIC_PROPOSAL",
        targetNationId,
        proposalType,
      });
    },
    [playerNationId, dispatchAction],
  );

  const declareWarDirectly = useCallback(
    (targetNationId: string) => {
      if (!playerNationId) {
        return;
      }
      dispatchAction({
        id: `war-declare-${Date.now()}`,
        nationId: playerNationId,
        type: "DECLARE_WAR",
        targetNationId,
      });
    },
    [playerNationId, dispatchAction],
  );

  return {
    proposeDiplomacy,
    declareWarDirectly,
  };
}
