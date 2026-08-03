import { GameState } from "@/domain/game/game-state.schema";
import { DomainEvent } from "@/domain/events/domain-event.schema";
import { DeltaPatchEngine } from "@/engine/events/delta-patch-engine";

export class StateHistory {
  private checkpoints = new Map<number, GameState>();
  private eventLogs = new Map<number, DomainEvent[]>();
  private patchEngine = new DeltaPatchEngine();

  public saveSnapshot(state: GameState): void {
    const turn = state.currentTurn;
    if (turn % 5 === 0 || !this.checkpoints.has(1)) {
      this.checkpoints.set(turn, JSON.parse(JSON.stringify(state)));
    }
  }

  public recordEvent(turn: number, event: DomainEvent): void {
    const list = this.eventLogs.get(turn) || [];
    list.push(event);
    this.eventLogs.set(turn, list);
  }

  public getTurnHistory(turnNumber: number): GameState | undefined {
    if (this.checkpoints.has(turnNumber)) {
      return this.checkpoints.get(turnNumber);
    }

    const checkpointTurns = Array.from(this.checkpoints.keys()).sort(
      (a, b) => b - a,
    );
    const closestBaseTurn = checkpointTurns.find((t) => t <= turnNumber);

    if (!closestBaseTurn) {
      return undefined;
    }

    let baseState = JSON.parse(
      JSON.stringify(this.checkpoints.get(closestBaseTurn)),
    ) as GameState;

    for (let t = closestBaseTurn; t <= turnNumber; t++) {
      const events = this.eventLogs.get(t) || [];
      for (let i = 0; i < events.length; i++) {
        const evt = events[i];
        if (evt && evt.deltaPatches) {
          baseState = this.patchEngine.applyPatches(
            baseState,
            evt.deltaPatches,
          );
        }
      }
    }

    return baseState;
  }
}
