import type { TurnLogEntry, TurnLogLevel } from "@/core/types/turn-log.types";

export class EventLogger {
  public createEntry(
    turn: number,
    sourceNationId: string,
    level: TurnLogLevel,
    message: string,
    targetNationId?: string,
    metadata?: Record<string, string | number | boolean>,
  ): TurnLogEntry {
    return {
      id: `${turn}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      turn,
      timestamp: Date.now(),
      sourceNationId,
      targetNationId,
      level,
      message,
      metadata,
    };
  }
}
