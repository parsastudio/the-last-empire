import { IndexedDbAdapter } from "@/infrastructure/storage/indexed-db-adapter";
import { DomainEvent, DeltaPatch } from "@/domain/events/domain-event.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { DeltaPatchEngine } from "@/engine/events/delta-patch-engine";
import { EventReplayEngine } from "@/engine/events/event-replay-engine";

export class EventStoreService {
  private adapter = new IndexedDbAdapter();
  private deltaEngine = new DeltaPatchEngine();
  private replayEngine = new EventReplayEngine();
  private sequenceCounters = new Map<string, number>();

  public async appendEvent(
    gameId: string,
    actionPayload: Record<string, unknown>,
    prevState: GameState,
    nextState: GameState,
  ): Promise<DomainEvent> {
    const currentSeq = await this.getNextSequence(gameId);
    const deltaPatches: DeltaPatch[] = this.deltaEngine.createDiff(
      prevState,
      nextState,
    );

    const event: DomainEvent = {
      id: `evt-${gameId}-seq${currentSeq}`,
      type: (actionPayload.type as string) || "GENERIC_ACTION",
      metadata: {
        gameId,
        sequence: currentSeq,
        turn: nextState.currentTurn,
        timestamp: Date.now(),
        actorNationId:
          (actionPayload.nationId as string) || nextState.humanNationId,
        clientVersion: "1.0.0",
      },
      actionPayload,
      deltaPatches,
    };

    await this.adapter.saveEvent(event);
    this.sequenceCounters.set(gameId, currentSeq);

    if (nextState.currentTurn % 5 === 0) {
      await this.adapter.saveCheckpoint(
        gameId,
        nextState.currentTurn,
        currentSeq,
        nextState,
      );
    }

    return event;
  }

  public async reconstructState(gameId: string): Promise<GameState | null> {
    const checkpointInfo = await this.adapter.getLatestCheckpoint(gameId);
    const allEvents = await this.adapter.getGameEvents(gameId);

    if (!checkpointInfo && allEvents.length === 0) {
      return this.adapter.loadState(gameId);
    }

    if (!checkpointInfo) {
      const fallbackState = await this.adapter.loadState(gameId);
      if (!fallbackState) return null;
      return this.replayEngine.replayStream(fallbackState, allEvents);
    }

    const relevantEvents = allEvents.filter(
      (e) => e.metadata.sequence > checkpointInfo.sequence,
    );

    return this.replayEngine.replayStream(checkpointInfo.state, relevantEvents);
  }

  public async getEventStream(gameId: string): Promise<DomainEvent[]> {
    return this.adapter.getGameEvents(gameId);
  }

  private async getNextSequence(gameId: string): Promise<number> {
    if (this.sequenceCounters.has(gameId)) {
      const next = (this.sequenceCounters.get(gameId) || 0) + 1;
      return next;
    }

    const events = await this.adapter.getGameEvents(gameId);
    if (events.length === 0) {
      return 1;
    }

    const lastSeq = events[events.length - 1]?.metadata.sequence || 0;
    return lastSeq + 1;
  }
}
