"use client";

import { useEffect, useRef, useCallback } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { useToast } from "@/presentation/context/toast-context";

const storageAdapter = new GameStorageAdapter();

export function useAutoSaveGame(gameId: string, gameState: GameState | null) {
  const { showToast } = useToast();
  const lastSavedTurnRef = useRef<number | null>(null);

  const saveStateToDb = useCallback(
    (state: GameState, isAutoSave = false) => {
      if (!state || !gameId) return;
      storageAdapter.saveGameState(gameId, state);
      lastSavedTurnRef.current = state.currentTurn;

      if (isAutoSave) {
        showToast(
          "ذخیره‌سازی خودکار",
          `چک‌پوینت نوبت ${state.currentTurn} در ذخیره‌سازی رویدادمحور به‌روز شد.`,
          "info",
        );
      }
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
    } else {
      saveStateToDb(gameState, false);
    }
  }, [gameState, saveStateToDb]);

  return { saveStateToDb };
}
