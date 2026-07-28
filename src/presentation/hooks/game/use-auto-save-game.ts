"use client";

import { useEffect, useRef, useCallback } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { IndexedDbAdapter } from "@/infrastructure/storage/indexed-db-adapter";
import { useToast } from "@/presentation/context/toast-context";

export function useAutoSaveGame(gameId: string, gameState: GameState | null) {
  const { showToast } = useToast();
  const dbAdapterRef = useRef(new IndexedDbAdapter());
  const lastSavedTurnRef = useRef<number | null>(null);

  const saveStateToDb = useCallback(
    async (state: GameState, isAutoSave = false) => {
      if (!state || !gameId) return;
      try {
        await dbAdapterRef.current.saveState(gameId, state);
        await dbAdapterRef.current.saveState("active_game", state);
        lastSavedTurnRef.current = state.currentTurn;

        if (isAutoSave) {
          showToast(
            "ذخیره‌سازی خودکار",
            `اطلاعات نوبت ${state.currentTurn} در IndexedDB بروزرسانی شد.`,
            "info",
          );
        }
      } catch {}
    },
    [gameId, showToast],
  );

  useEffect(() => {
    if (!gameState) return;

    if (
      lastSavedTurnRef.current !== null &&
      gameState.currentTurn !== lastSavedTurnRef.current
    ) {
      saveStateToDb(gameState, true);
    }
  }, [gameState, saveStateToDb]);

  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      saveStateToDb(gameState, false);
    }, 30000);

    return () => clearInterval(interval);
  }, [gameState, saveStateToDb]);

  return { saveStateToDb };
}
