import { useEffect, useMemo } from "react";
import { useSessionState } from "./use-session-state";
import { useMapEngine } from "./use-map-engine";
import { useLocalMarketTrade } from "./use-local-market-trade";
import { useLocalRecruitment } from "./use-local-recruitment";
import { useLocalEconomyControl } from "./use-local-economy-control";
import { useDiplomacyActions } from "./use-diplomacy-actions";
import { useStateUpgrades } from "./use-state-upgrades";
import { useLocalDoctrines } from "./use-local-doctrines";
import { useTacticalOptions } from "./use-tactical-options";
import { useNationSelector } from "./use-nation-selector";
import { useTacticalAttack } from "./use-tactical-attack";
import { useTurnProgression } from "./use-turn-progression";
import { useGlobalRankings } from "./use-global-rankings";
import { useTurnLogs } from "./use-turn-logs";

export function useTacticalSimulationState(
  onSelectionPending: (pending: { id: string; name: string } | null) => void,
) {
  const { playerNationId, setPlayerNationId, resetSession } = useSessionState();
  const {
    gameState,
    initializeGame,
    dispatchAction,
    processNextTurn,
    gridState,
  } = useMapEngine();

  const { buyResource } = useLocalMarketTrade(playerNationId, dispatchAction);
  const { recruitUnits } = useLocalRecruitment(playerNationId, dispatchAction);
  const { updateTaxRate } = useLocalEconomyControl(
    playerNationId,
    dispatchAction,
  );
  const { proposeDiplomacy, declareWarDirectly } = useDiplomacyActions(
    playerNationId,
    dispatchAction,
  );
  const { upgradeInfrastructure, upgradeIndustrialLevel } = useStateUpgrades(
    playerNationId,
    dispatchAction,
  );
  const { unlockDoctrineType } = useLocalDoctrines(
    playerNationId,
    dispatchAction,
  );
  const { forceSuccess, toggleForceSuccess } = useTacticalOptions();

  const rankings = useGlobalRankings(gameState);
  const { filteredLogs } = useTurnLogs(gameState);

  const { selectNation } = useNationSelector((id) => {
    setPlayerNationId(id);
    onSelectionPending(null);
    initializeGame(id);
  });

  const { executeAttack, isAttacking } = useTacticalAttack(
    playerNationId,
    () => {
      if (playerNationId) {
        initializeGame(playerNationId);
      }
    },
  );

  const { advanceTurn, isAdvancing } = useTurnProgression(() => {
    processNextTurn();
  });

  useEffect(() => {
    if (playerNationId && !gameState) {
      initializeGame(playerNationId);
    }
  }, [playerNationId, gameState, initializeGame]);

  const humanNation = useMemo(() => {
    if (!gameState || !playerNationId) {
      return null;
    }
    return gameState.nations[playerNationId] || null;
  }, [gameState, playerNationId]);

  return {
    playerNationId,
    setPlayerNationId,
    resetSession,
    gameState,
    gridState,
    buyResource,
    recruitUnits,
    updateTaxRate,
    proposeDiplomacy,
    declareWarDirectly,
    upgradeInfrastructure,
    upgradeIndustrialLevel,
    unlockDoctrineType,
    forceSuccess,
    toggleForceSuccess,
    rankings,
    filteredLogs,
    selectNation,
    executeAttack,
    isAttacking,
    advanceTurn,
    isAdvancing,
    humanNation,
  };
}
