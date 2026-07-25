import { useCallback } from "react";
import { GameAction } from "@/domain/game/action.schema";

export function useStateUpgrades(
  playerNationId: string | null,
  dispatchAction: (action: GameAction) => void,
) {
  const upgradeInfrastructure = useCallback(() => {
    if (!playerNationId) {
      return;
    }
    dispatchAction({
      id: `infra-up-${Date.now()}`,
      nationId: playerNationId,
      type: "INVEST_INFRASTRUCTURE",
    });
  }, [playerNationId, dispatchAction]);

  const upgradeIndustrialLevel = useCallback(() => {
    if (!playerNationId) {
      return;
    }
    dispatchAction({
      id: `industrial-up-${Date.now()}`,
      nationId: playerNationId,
      type: "UPGRADE_INDUSTRIAL_LEVEL",
    });
  }, [playerNationId, dispatchAction]);

  return {
    upgradeInfrastructure,
    upgradeIndustrialLevel,
  };
}
