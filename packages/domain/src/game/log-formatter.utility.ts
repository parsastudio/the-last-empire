import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { WarLogFormatter } from "@/domain/game/formatters/war-log-formatter";
import { DiplomacyLogFormatter } from "@/domain/game/formatters/diplomacy-log-formatter";
import { NationalEventsLogFormatter } from "@/domain/game/formatters/national-events-log-formatter";

export class TurnLogFormatter {
  private static resolveName(
    id: string | undefined,
    nationsMap?: Record<string, Nation>,
  ): string {
    if (!id) return "کشور نامشخص";
    const canonical = CountryRegistry.resolveCanonicalId(id);
    const nation = nationsMap ? nationsMap[canonical] || nationsMap[id] : null;
    if (nation) return nation.name;
    const profile = CountryRegistry.getCountry(canonical);
    return profile ? profile.nameFa : canonical;
  }

  public static formatMessage(
    log: TurnLogEntry,
    nationsMap?: Record<string, Nation>,
  ): string {
    const sourceName = this.resolveName(log.sourceNationId, nationsMap);
    const targetName = this.resolveName(log.targetNationId, nationsMap);
    const params = log.params || {};

    const warFormatted = WarLogFormatter.format(
      log.eventCode,
      sourceName,
      targetName,
      params,
    );
    if (warFormatted) return warFormatted;

    const dipFormatted = DiplomacyLogFormatter.format(
      log.eventCode,
      sourceName,
      targetName,
      params,
    );
    if (dipFormatted) return dipFormatted;

    return NationalEventsLogFormatter.format(
      log.eventCode,
      sourceName,
      targetName,
      params,
      log.message,
    );
  }
}
