import {
  TurnLogEntry,
  TurnLogLevel,
  TurnLogScope,
  TurnLogCategory,
} from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";

export type { Nation } from "@/domain/nation/nation.schema";
export type { AIPersonalityType } from "@/domain/ai/ai.schema";

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
    message: string,
    category: TurnLogCategory = "DOMESTIC",
    scope: TurnLogScope = "NATIONAL",
    targetNationId?: string,
    conquerorNationId?: string,
    metadata?: Record<string, string | number | boolean>,
  ): TurnLogEntry {
    const cleanSource = CountryRegistry.resolveCanonicalId(sourceNationId);
    const cleanTarget = targetNationId
      ? CountryRegistry.resolveCanonicalId(targetNationId)
      : undefined;
    const cleanConqueror = conquerorNationId
      ? CountryRegistry.resolveCanonicalId(conquerorNationId)
      : undefined;
    const randomSuffix = Math.random().toString(36).substring(2, 7);

    return {
      id: `log-${cleanSource}-t${turn}-${randomSuffix}`,
      turn,
      timestamp: Date.now(),
      sourceNationId: cleanSource,
      targetNationId: cleanTarget,
      conquerorNationId: cleanConqueror,
      scope,
      category,
      level,
      message,
      metadata,
    };
  }

  public static createNationalLog(
    turn: number,
    nationId: string,
    category: "DOMESTIC" | "MILITARY" | "DIPLOMACY" | "ESPIONAGE",
    level: TurnLogLevel,
    message: string,
    targetNationId?: string,
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      nationId,
      level,
      message,
      category,
      "NATIONAL",
      targetNationId,
    );
  }

  public static createGlobalWarLog(
    turn: number,
    attackerId: string,
    defenderId: string,
    message: string,
    level: TurnLogLevel = "CRITICAL",
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      attackerId,
      level,
      message,
      "GLOBAL_WAR",
      "GLOBAL",
      defenderId,
    );
  }

  public static createGlobalDiplomacyLog(
    turn: number,
    sourceNationId: string,
    targetNationId: string,
    message: string,
    level: TurnLogLevel = "INFO",
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      sourceNationId,
      level,
      message,
      "GLOBAL_DIPLOMACY",
      "GLOBAL",
      targetNationId,
    );
  }

  public static createAnnexationLog(
    turn: number,
    conquerorId: string,
    eliminatedNationId: string,
    message: string,
  ): TurnLogEntry {
    return this.createLogEntry(
      turn,
      eliminatedNationId,
      "CRITICAL",
      message,
      "GLOBAL_ANNEXATION",
      "GLOBAL",
      undefined,
      conquerorId,
    );
  }
}
