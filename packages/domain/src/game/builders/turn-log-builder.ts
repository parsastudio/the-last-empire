import {
  TurnLogEntry,
  TurnLogLevel,
  TurnLogScope,
  TurnLogCategory,
  TurnLogEventCode,
  TurnLogParamValue,
} from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { GameIdGenerator } from "@/domain/shared/utils/game-id-generator";

export class TurnLogBuilder {
  public static createLogEntry(
    turn: number,
    sourceNationId: string,
    level: TurnLogLevel,
    eventCode: TurnLogEventCode,
    category: TurnLogCategory = "DOMESTIC",
    scope: TurnLogScope = "NATIONAL",
    targetNationId?: string,
    params: Record<string, TurnLogParamValue> = {},
    message = "",
  ): TurnLogEntry {
    const cleanSource = CountryRegistry.resolveCanonicalId(sourceNationId);
    const cleanTarget = targetNationId
      ? CountryRegistry.resolveCanonicalId(targetNationId)
      : undefined;

    return {
      id: GameIdGenerator.generateId(`log-${cleanSource}-t${turn}`),
      turn,
      timestamp: Date.now(),
      eventCode,
      sourceNationId: cleanSource,
      targetNationId: cleanTarget,
      scope,
      category,
      level,
      message,
      params,
    };
  }

  public static createNationalLog(
    turn: number,
    nationId: string,
    category: "DOMESTIC" | "MILITARY" | "DIPLOMACY" | "ESPIONAGE",
    level: TurnLogLevel,
    eventCode: TurnLogEventCode,
    params: Record<string, TurnLogParamValue> = {},
    targetNationId?: string,
    message = "",
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      nationId,
      level,
      eventCode,
      category,
      "NATIONAL",
      targetNationId,
      params,
      message,
    );
  }

  public static createBankruptcyLog(
    turn: number,
    nationId: string,
    params: Record<string, TurnLogParamValue> = {},
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      nationId,
      "CRITICAL",
      "NATION_BANKRUPTCY",
      "DOMESTIC",
      "NATIONAL",
      undefined,
      params,
    );
  }

  public static createGlobalWarLog(
    turn: number,
    attackerId: string,
    defenderId: string,
    eventCode: TurnLogEventCode,
    params: Record<string, TurnLogParamValue> = {},
    level: TurnLogLevel = "CRITICAL",
    message = "",
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      attackerId,
      level,
      eventCode,
      "GLOBAL_WAR",
      "GLOBAL",
      defenderId,
      params,
      message,
    );
  }

  public static createGlobalDiplomacyLog(
    turn: number,
    sourceNationId: string,
    targetNationId: string,
    eventCode: TurnLogEventCode,
    params: Record<string, TurnLogParamValue> = {},
    level: TurnLogLevel = "INFO",
    message = "",
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      sourceNationId,
      level,
      eventCode,
      "GLOBAL_DIPLOMACY",
      "GLOBAL",
      targetNationId,
      params,
      message,
    );
  }

  public static createDefensePactNeutralityLog(
    turn: number,
    guarantorId: string,
    targetId: string,
    params: Record<string, TurnLogParamValue> = {},
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      guarantorId,
      "WARNING",
      "DEFENSE_PACT_NEUTRALITY",
      "GLOBAL_DIPLOMACY",
      "GLOBAL",
      targetId,
      params,
    );
  }

  public static createDefensePactRefusalCompensationLog(
    turn: number,
    guarantorId: string,
    victimId: string,
    params: Record<string, TurnLogParamValue> = {},
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      guarantorId,
      "WARNING",
      "DEFENSE_PACT_REFUSAL_COMPENSATION",
      "GLOBAL_DIPLOMACY",
      "GLOBAL",
      victimId,
      params,
    );
  }

  public static createAnnexationLog(
    turn: number,
    conquerorId: string,
    eliminatedNationId: string,
    params: Record<string, TurnLogParamValue> = {},
    message = "",
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      conquerorId,
      "CRITICAL",
      "NATION_ANNEXED",
      "GLOBAL_ANNEXATION",
      "GLOBAL",
      eliminatedNationId,
      params,
      message,
    );
  }

  public static createCoalitionFormedLog(
    turn: number,
    targetNationId: string,
    memberNames: string,
    memberIds = "",
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      targetNationId,
      "CRITICAL",
      "COALITION_FORMED",
      "GLOBAL_WAR",
      "NATIONAL",
      undefined,
      { memberNames, memberIds },
    );
  }

  public static createVictoryLog(
    turn: number,
    winnerNationId: string,
    reason = "WORLD_DOMINANCE",
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      winnerNationId,
      "CRITICAL",
      "VICTORY_ACHIEVED",
      "GLOBAL_WAR",
      "NATIONAL",
      undefined,
      { reason },
    );
  }
}
