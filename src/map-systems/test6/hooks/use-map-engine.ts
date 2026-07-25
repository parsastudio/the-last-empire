import { useState, useCallback, useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameEngine } from "@/engine/game-engine";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GameStateInitializer } from "../engine/game-state-initializer";

export function useMapEngine() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const gridState = useMemo(() => GridStateProvider.getInstance(), []);
  const initializer = useMemo(() => new GameStateInitializer(), []);

  const engine = useMemo(() => {
    if (!gameState) {
      return null;
    }
    const cloned = { ...gameState, gridState };
    return new GameEngine(cloned);
  }, [gameState, gridState]);

  const initializeGame = useCallback(
    (nationId: string) => {
      const state = initializer.initializeSimulationForNation(
        nationId,
        gridState,
      );
      setGameState(state);
    },
    [initializer, gridState],
  );

  const dispatchAction = useCallback(
    (action: GameAction) => {
      if (!engine) {
        return {
          success: false,
          actionId: action.id,
          message: "Engine not ready",
        };
      }
      const result = engine.dispatchAction(action);
      if (result.success) {
        setGameState(engine.getState());
      }
      return result;
    },
    [engine],
  );

  const processNextTurn = useCallback(() => {
    if (!engine) {
      return null;
    }
    const nextState = engine.nextTurn();
    setGameState(nextState);
    return nextState;
  }, [engine]);

  return {
    gameState,
    setGameState,
    initializeGame,
    dispatchAction,
    processNextTurn,
    gridState,
  };
}
