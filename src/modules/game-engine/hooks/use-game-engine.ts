import { useState, useEffect, useCallback, useMemo } from "react";
import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  ActionResult,
} from "@/modules/game-engine/schemas/action.schema";
import { GameEngine } from "../domain/game-engine";
import { IndexedDbAdapter } from "@/infrastructure/storage/indexed-db-adapter";
import { SyncEngine } from "@/infrastructure/sync/sync-engine";

export function useGameEngine(initialState: GameState | null) {
  const [state, setState] = useState<GameState | null>(initialState);
  const [error, setError] = useState<string | null>(null);

  const dbAdapter = useMemo(() => new IndexedDbAdapter(), []);
  const syncEngine = useMemo(() => new SyncEngine(), []);

  const engine = useMemo(() => {
    if (!state) {
      return null;
    }
    return new GameEngine(state);
  }, [state]);

  useEffect(() => {
    if (state) {
      syncEngine.queueStateSync(state);
    }
  }, [state, syncEngine]);

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
        const loaded = await dbAdapter.loadState(gameId);
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
    [dbAdapter],
  );

  return {
    state,
    error,
    dispatch,
    processNextTurn,
    loadSavedGame,
    clearError: () => setError(null),
  };
}
