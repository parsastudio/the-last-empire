import { TurnLogEntry } from "@/domain/game/game-state.schema";

export class CombatEventLogger {
  public createLogEntry(
    turn: number,
    sourceNationId: string,
    targetNationId: string,
    message: string,
  ): TurnLogEntry {
    return {
      id: `combat-${turn}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      turn,
      timestamp: Date.now(),
      sourceNationId,
      targetNationId,
      level: "COMBAT",
      message,
    };
  }
}
