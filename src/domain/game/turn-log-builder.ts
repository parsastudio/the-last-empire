import { TurnLogEntry, TurnLogLevel } from "@/domain/game/game-state.schema";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export class TurnLogBuilder {
  public static createLogEntry(
    turn: number,
    sourceNationId: string,
    level: TurnLogLevel,
    message: string,
  ): TurnLogEntry {
    const canonical = NationIdResolver.resolveCanonicalId(sourceNationId);
    const cleanNation = canonical.replace("NATION_", "");
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return {
      id: `log-${cleanNation}-t${turn}-${randomSuffix}`,
      turn,
      timestamp: Date.now(),
      sourceNationId,
      level,
      message,
    };
  }
}
