import { TurnLogEntry, TurnLogScope } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries/country-registry";

export class TurnLogFilterUtility {
  public static matchesScope(
    log: TurnLogEntry,
    scope: TurnLogScope,
    humanNationId?: string,
  ): boolean {
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
    turn?: number | "ALL",
    searchQuery?: string,
  ): TurnLogEntry[] {
    return logs.filter((log) => {
      if (turn !== undefined && turn !== "ALL" && log.turn !== turn) {
        return false;
      }
      if (!this.matchesScope(log, scope, humanNationId)) {
        return false;
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const event = log.eventCode?.toLowerCase() || "";
        const source = log.sourceNationId?.toLowerCase() || "";
        const target = log.targetNationId?.toLowerCase() || "";
        const msg = log.message?.toLowerCase() || "";
        const paramMatches = Object.values(log.params || {}).some((v) =>
          String(v).toLowerCase().includes(q),
        );
        return (
          event.includes(q) ||
          source.includes(q) ||
          target.includes(q) ||
          msg.includes(q) ||
          paramMatches
        );
      }
      return true;
    });
  }
}
