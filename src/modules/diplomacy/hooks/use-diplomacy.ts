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

  const fundEspionage = useCallback(
    (targetNationId: string, budget: number) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `fund-esp-${Date.now()}`,
        nationId: nation.id,
        type: "FUND_ESPIONAGE",
        targetNationId,
        budget,
      });
    },
    [nation, dispatch],
  );

  const executeCovertOperation = useCallback(
    (
      targetNationId: string,
      operationType:
        | "SABOTAGE_INDUSTRY"
        | "INSTIGATE_UNREST"
        | "MILITARY_INTEL_HEIST",
    ) => {
      if (!nation) {
        return;
      }
      dispatch({
        id: `covert-${Date.now()}`,
        nationId: nation.id,
        type: "COVERT_OPERATIONS",
        targetNationId,
        operationType,
      });
    },
    [nation, dispatch],
  );

  return {
    proposeTreaty,
    declareWar,
    fundEspionage,
    executeCovertOperation,
  };
}
