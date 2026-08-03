import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/domain/data/countries";
import { TurnLogEntry, TurnLogLevel } from "@/domain/game/game-state.schema";

export type GameErrorCode =
  | "INVALID_ACTION"
  | "NATION_NOT_FOUND"
  | "INSUFFICIENT_FUNDS"
  | "INSUFFICIENT_RESOURCES"
  | "INVALID_GOVERNMENT_CHANGE"
  | "STATE_FROZEN"
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
    const cleanCountry = countryCode.toUpperCase().replace("NATION_", "");
    return `${cleanCountry}-${code}`;
  }
}

export class NationIdResolver {
  public static resolveCanonicalId(codeOrId: string): string {
    if (!codeOrId) return "";

    const clean = codeOrId.trim().toUpperCase();

    let profile = findCountryProfileByCode(clean);
    if (!profile) {
      const rawNum = clean.replace("NATION_", "");
      const numericId = parseInt(rawNum, 10);
      if (!isNaN(numericId)) {
        profile = findCountryProfileById(numericId);
      }
    }

    if (profile) {
      return `NATION_${profile.code.toUpperCase()}`;
    }

    if (clean.startsWith("NATION_")) {
      return clean;
    }

    return `NATION_${clean}`;
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

  public nextInt(min: number, max: number): number {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(this.nextFloat() * (maxFloor - minCeil + 1)) + minCeil;
  }

  public nextBool(probability = 0.5): boolean {
    return this.nextFloat() < probability;
  }

  public getSeed(): number {
    return this.seed;
  }
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (typeof structuredClone !== "undefined") {
    return structuredClone(obj);
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const copy = {} as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    copy[key] = deepClone((obj as Record<string, unknown>)[key]);
  }

  return copy as T;
}

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
