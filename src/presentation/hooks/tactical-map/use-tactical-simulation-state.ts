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
import { findCountryProfileByCode } from "@/domain/map/countries";

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

  const mappedPlayerNationId = useMemo(() => {
    if (!playerNationId) return null;
    if (playerNationId.startsWith("NATION_")) return playerNationId;
    const profile = findCountryProfileByCode(playerNationId);
    return profile ? `NATION_${profile.id}` : playerNationId;
  }, [playerNationId]);

  const { buyResource } = useLocalMarketTrade(
    mappedPlayerNationId,
    dispatchAction,
  );
  const { recruitUnits } = useLocalRecruitment(
    mappedPlayerNationId,
    dispatchAction,
  );
  const { updateTaxRate } = useLocalEconomyControl(
    mappedPlayerNationId,
    dispatchAction,
  );
  const { proposeDiplomacy, declareWarDirectly } = useDiplomacyActions(
    mappedPlayerNationId,
    dispatchAction,
  );
  const { upgradeInfrastructure, upgradeIndustrialLevel } = useStateUpgrades(
    mappedPlayerNationId,
    dispatchAction,
  );
  const { unlockDoctrineType } = useLocalDoctrines(
    mappedPlayerNationId,
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
    mappedPlayerNationId,
    () => {
      if (mappedPlayerNationId) {
        initializeGame(mappedPlayerNationId);
      }
    },
  );

  const { advanceTurn, isAdvancing } = useTurnProgression(() => {
    processNextTurn();
  });

  useEffect(() => {
    if (mappedPlayerNationId && !gameState) {
      initializeGame(mappedPlayerNationId);
    }
  }, [mappedPlayerNationId, gameState, initializeGame]);

  const humanNation = useMemo(() => {
    if (!gameState || !mappedPlayerNationId) {
      return null;
    }
    return gameState.nations[mappedPlayerNationId] || null;
  }, [gameState, mappedPlayerNationId]);

  return {
    playerNationId: mappedPlayerNationId,
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
