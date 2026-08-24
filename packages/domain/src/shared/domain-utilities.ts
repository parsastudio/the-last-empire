import {
  TurnLogEntry,
  TurnLogLevel,
  TurnLogScope,
  TurnLogCategory,
  TurnLogEventCode,
  TurnLogParamValue,
} from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";

export type { Nation } from "@/domain/nation/nation.schema";

export type GameErrorCode =
  | "INVALID_ACTION"
  | "NATION_NOT_FOUND"
  | "INSUFFICIENT_FUNDS"
  | "INSUFFICIENT_RESOURCES"
  | "EXECUTION_FAILED"
  | "UNKNOWN_ACTION"
  | "GAME_OVER";

export class GameError extends Error {
  public readonly code: GameErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: GameErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "GameError";
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, GameError.prototype);
  }
}

export class GameIdGenerator {
  public static generateCampaignId(countryCode = "IRN"): string {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    const cleanCountry = CountryRegistry.resolveCanonicalId(countryCode);
    return `${cleanCountry}-${code}`;
  }
}

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed | 0;
  }

  public nextFloat(): number {
    let t = (this.seed = (this.seed + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public getSeed(): number {
    return this.seed;
  }
}

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
    const randomSuffix = Math.random().toString(36).substring(2, 7);

    return {
      id: `log-${cleanSource}-t${turn}-${randomSuffix}`,
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

  public static createCoalitionMemberFallenLog(
    turn: number,
    fallenNationId: string,
    targetNationId: string,
    remainingCount: number,
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      fallenNationId,
      "CRITICAL",
      "COALITION_MEMBER_FALLEN",
      "GLOBAL_WAR",
      "GLOBAL",
      targetNationId,
      { remainingCount },
    );
  }
}
