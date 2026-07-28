import type {
  TurnLogEntry,
  TurnLogLevel,
} from "@/domain/game/game-state.schema";

export class EventLogger {
  private logSequence = 0;

  public createEntry(
    turn: number,
    sourceNationId: string,
    level: TurnLogLevel,
    message: string,
    targetNationId?: string,
    metadata?: Record<string, string | number | boolean>,
  ): TurnLogEntry {
    this.logSequence++;
    const cleanNation = sourceNationId.replace("NATION_", "");
    const id = `log-${cleanNation}-t${turn}-s${this.logSequence}`;

    return {
      id,
      turn,
      timestamp: 1700000000000 + turn * 1000 + this.logSequence,
      sourceNationId,
      targetNationId,
      level,
      message,
      metadata,
    };
  }
}
