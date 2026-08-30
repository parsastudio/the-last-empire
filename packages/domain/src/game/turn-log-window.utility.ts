import { TurnLogEntry } from "@/domain/game/game-state.schema";

export class TurnLogWindowUtility {
  public static readonly MAX_RETAINED_TURNS = 4;

  public static pruneLogs(
    logs: TurnLogEntry[],
    currentTurn: number,
    retainedTurnsCount: number = TurnLogWindowUtility.MAX_RETAINED_TURNS,
  ): TurnLogEntry[] {
    const minRetainedTurn = Math.max(1, currentTurn - (retainedTurnsCount - 1));
    return logs.filter(
      (log) =>
        log.turn >= minRetainedTurn || log.eventCode === "VICTORY_ACHIEVED",
    );
  }
}
