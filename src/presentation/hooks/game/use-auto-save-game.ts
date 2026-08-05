"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { AsyncSaveQueueService } from "@/infrastructure/storage/async-save-queue.service";
import { useToast } from "@/presentation/context/toast-context";

export function useAutoSaveGame(gameId: string, gameState: GameState | null) {
  const { showToast } = useToast();
  const saveQueue = useMemo(() => AsyncSaveQueueService.getInstance(), []);
  const lastSavedTurnRef = useRef<number | null>(null);

  const saveStateToDb = useCallback(
    (state: GameState, isAutoSave = false) => {
      if (!state || !gameId) return;
      saveQueue.enqueueSave(gameId, state, isAutoSave);
      lastSavedTurnRef.current = state.currentTurn;

      if (isAutoSave) {
        showToast(
          "ذخیره‌سازی خودکار",
          `چک‌پوینت نوبت ${state.currentTurn} در ذخیره‌سازی رویدادمحور به‌روز شد.`,
          "info",
        );
      }
    },
    [gameId, saveQueue, showToast],
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
