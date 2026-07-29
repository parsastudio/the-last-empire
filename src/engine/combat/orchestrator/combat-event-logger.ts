import { TurnLogEntry } from "@/domain/game/game-state.schema";

export class CombatEventLogger {
  private combatSeq = 0;

  public createLogEntry(
    turn: number,
    sourceNationId: string,
    targetNationId: string,
    message: string,
  ): TurnLogEntry {
    this.combatSeq++;
    const cleanSource = sourceNationId.replace("NATION_", "");
    const cleanTarget = targetNationId.replace("NATION_", "");
    const randomSuffix = Math.random().toString(36).substring(2, 7);

    return {
      id: `combat-${cleanSource}-${cleanTarget}-t${turn}-s${this.combatSeq}-${randomSuffix}`,
      turn,
      timestamp: 1700000000000 + turn * 1000 + this.combatSeq,
      sourceNationId,
      targetNationId,
      level: "COMBAT",
      message,
    };
  }
}
