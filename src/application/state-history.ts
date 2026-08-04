import { GameState } from "@/domain/game/game-state.schema";

export class StateHistory {
  private checkpoints = new Map<number, GameState>();

  public saveSnapshot(state: GameState): void {
    const turn = state.currentTurn;
    if (turn % 5 === 0 || !this.checkpoints.has(1)) {
      this.checkpoints.set(turn, JSON.parse(JSON.stringify(state)));
    }
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

    return this.checkpoints.get(closestBaseTurn);
  }
}
