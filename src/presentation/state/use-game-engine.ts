import { useState, useEffect, useCallback, useMemo } from "react";
import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GameEngine } from "@/engine/game-engine";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GridStateGameSaveAdapter } from "@/engine/combat/persistence/grid-state-game-save-adapter";
import { GridSyncCoordinator } from "@/engine/combat/persistence/grid-sync-coordinator";

export function useGameEngine(initialState: GameState | null) {
  const [state, setState] = useState<GameState | null>(initialState);
  const [error, setError] = useState<string | null>(null);

  const gridState = useMemo(() => GridStateProvider.getInstance(), []);
  const dbAdapter = useMemo(() => new GridStateGameSaveAdapter(), []);
  const syncCoordinator = useMemo(() => new GridSyncCoordinator(), []);

  const engine = useMemo(() => {
    if (!state) {
      return null;
    }
    (state as { gridState?: GridState }).gridState = gridState;
    return new GameEngine(state);
  }, [state, gridState]);

  useEffect(() => {
    if (state) {
      syncCoordinator.queueGridSync(state.gameId, gridState);
    }
  }, [state, gridState, syncCoordinator]);

  const dispatch = useCallback(
    (action: GameAction): ActionResult => {
      if (!engine) {
        return {
          success: false,
          actionId: action.id,
          message: "Engine not initialized",
        };
      }
      const result = engine.dispatchAction(action);
      if (result.success) {
        setState(engine.getState());
      } else if (result.error) {
        setError(result.message);
      }
      return result;
    },
    [engine],
  );

  const processNextTurn = useCallback((): GameState | null => {
    if (!engine) {
      return null;
    }
    const nextState = engine.nextTurn();
    setState(nextState);
    return nextState;
  }, [engine]);

  const loadSavedGame = useCallback(
    async (gameId: string) => {
      try {
        const loaded = await dbAdapter.loadCompleteGame(gameId, gridState);
        if (loaded) {
          setState(loaded);
          setError(null);
        } else {
          setError("No saved state found for this game ID");
        }
      } catch {
        setError("Failed to load game save file");
      }
    },
    [dbAdapter, gridState],
  );

  return {
    state,
    gridState,
    error,
    dispatch,
    processNextTurn,
    loadSavedGame,
    clearError: () => setError(null),
  };
}
