import { useState, useCallback, useMemo } from "react";
import { GameState } from "@/domain/game/game-state.schema";
import { DomainEvent } from "@/domain/events/domain-event.schema";
import { ClientStorageService } from "@/infrastructure/storage/client-storage.service";

export function useGameHistoryReplay(gameId: string) {
  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [currentSequence, setCurrentSequence] = useState<number>(0);
  const [replayedState, setReplayedState] = useState<GameState | null>(null);

  const storageService = useMemo(() => new ClientStorageService(), []);

  const loadEventHistory = useCallback(async () => {
    if (!gameId) return;
    const stream = await storageService.getEventStore().getEventStream(gameId);
    setEvents(stream);
    if (stream.length > 0) {
      const maxSeq = stream[stream.length - 1]?.metadata.sequence || 0;
      setCurrentSequence(maxSeq);
    }
  }, [gameId, storageService]);

  const startReplay = useCallback(async () => {
    await loadEventHistory();
    setIsReplaying(true);
  }, [loadEventHistory]);

  const stopReplay = useCallback(() => {
    setIsReplaying(false);
    setReplayedState(null);
  }, []);

  const jumpToSequence = useCallback(
    async (sequence: number) => {
      if (!gameId || events.length === 0) return;
      const targetSeq = Math.max(
        1,
        Math.min(sequence, events[events.length - 1]?.metadata.sequence || 1),
      );
      setCurrentSequence(targetSeq);

      const reconstructed = await storageService
        .getEventStore()
        .reconstructState(gameId);

      if (reconstructed) {
        setReplayedState(reconstructed);
      }
    },
    [gameId, events, storageService],
  );

  const nextEvent = useCallback(() => {
    jumpToSequence(currentSequence + 1);
  }, [currentSequence, jumpToSequence]);

  const prevEvent = useCallback(() => {
    jumpToSequence(currentSequence - 1);
  }, [currentSequence, jumpToSequence]);

  return {
    events,
    isReplaying,
    currentSequence,
    replayedState,
    loadEventHistory,
    startReplay,
    stopReplay,
    jumpToSequence,
    nextEvent,
    prevEvent,
  };
}
