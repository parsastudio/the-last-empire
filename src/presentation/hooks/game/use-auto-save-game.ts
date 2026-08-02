"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";
import { useToast } from "@/presentation/context/toast-context";

export function useAutoSaveGame(gameId: string, gameState: GameState | null) {
  const { showToast } = useToast();
  const storageService = useMemo(() => new ClientStorageService(), []);
  const lastSavedTurnRef = useRef<number | null>(null);

  const saveStateToDb = useCallback(
    async (state: GameState, isAutoSave = false) => {
      if (!state || !gameId) return;
      try {
        await storageService.saveGameState(gameId, state);
        lastSavedTurnRef.current = state.currentTurn;

        if (isAutoSave) {
          showToast(
            "ذخیره‌سازی خودکار",
            `اطلاعات نوبت ${state.currentTurn} در دیتابیس بروزرسانی شد.`,
            "info",
          );
        }
      } catch {}
    },
    [gameId, storageService, showToast],
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

  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      saveStateToDb(gameState, false);
    }, 30000);

    return () => clearInterval(interval);
  }, [gameState, saveStateToDb]);

  return { saveStateToDb };
}
