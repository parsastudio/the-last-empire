import { TurnLogEntry, TurnLogScope } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries/country-registry";

export class TurnLogFilterUtility {
  public static isDilemmaLog(log: TurnLogEntry): boolean {
    return log.eventCode === "DILEMMA_RESOLVED";
  }

  public static matchesScope(
    log: TurnLogEntry,
    scope: TurnLogScope,
    humanNationId?: string,
  ): boolean {
    if (this.isDilemmaLog(log)) {
      return false;
    }

    if (scope === "GLOBAL") {
      return log.scope === "GLOBAL";
    }

    if (scope === "NATIONAL") {
      if (!humanNationId) {
        return log.scope === "NATIONAL";
      }

      const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNationId);
      const src = CountryRegistry.resolveCanonicalId(log.sourceNationId);
      const trg = log.targetNationId
        ? CountryRegistry.resolveCanonicalId(log.targetNationId)
        : null;

      return src === canonicalHuman || trg === canonicalHuman;
    }

    return true;
  }

  public static filterLogs(
    logs: TurnLogEntry[],
    scope: TurnLogScope,
    humanNationId?: string,
  ): TurnLogEntry[] {
    return logs.filter((log) => this.matchesScope(log, scope, humanNationId));
  }
}
