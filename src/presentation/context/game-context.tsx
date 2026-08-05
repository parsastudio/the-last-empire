"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { useBitPackedGame } from "@/presentation/hooks/game/final/use-bit-packed-game";
import { ActionDispatcherService } from "@/presentation/services/action-dispatcher.service";
import { useToast } from "@/presentation/context/toast-context";

interface GameContextType {
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  dispatchAction: (
    action: GameAction,
    onSuccessMessage?: string,
  ) => Promise<boolean>;
  advanceNextTurn: () => Promise<GameState | null>;
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);

export function GameProvider({
  gameId,
  children,
}: {
  gameId: string;
  children: React.ReactNode;
}) {
  const { showToast } = useToast();
  const { gameState, setGameState, loading, error, advanceNextTurn } =
    useBitPackedGame(gameId);

  const dispatcher = useMemo(() => new ActionDispatcherService(), []);
  const turnPromiseQueueRef = useRef<Promise<GameState | null>>(
    Promise.resolve(null),
  );

  const dispatchAction = useCallback(
    async (action: GameAction, onSuccessMessage?: string): Promise<boolean> => {
      const activeGameId = gameId || gameState?.gameId || "default_game";

      const result = await dispatcher.dispatch(action, activeGameId, gameState);

      if (result.success && result.newState) {
        setGameState(result.newState);
        if (onSuccessMessage) {
          showToast("دستور صادر شد", onSuccessMessage, "success");
        }
        return true;
      }

      showToast(
        "خطا در اجرای دستور",
        result.message || "امکان انجام این دستور وجود ندارد.",
        "error",
      );
      return false;
    },
    [gameId, gameState, dispatcher, setGameState, showToast],
  );

  const queueAdvanceNextTurn = useCallback((): Promise<GameState | null> => {
    const nextPromise = turnPromiseQueueRef.current.then(async () => {
      return await advanceNextTurn();
    });

    turnPromiseQueueRef.current = nextPromise.catch(() => null);
    return nextPromise;
  }, [advanceNextTurn]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        loading,
        error,
        dispatchAction,
        advanceNextTurn: queueAdvanceNextTurn,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
