import {
  ALL_COUNTRY_PROFILES,
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

class NationIdCacheRegistry {
  public static readonly canonicalCache = new Map<string, string>();
  public static readonly numericCache = new Map<string, number>();

  static {
    for (const profile of ALL_COUNTRY_PROFILES) {
      const canonical = `NATION_${profile.code.toUpperCase()}`;
      const numeric = profile.id ?? 0;

      this.canonicalCache.set(profile.code.toUpperCase(), canonical);
      this.canonicalCache.set(canonical, canonical);

      if (profile.flagCode) {
        this.canonicalCache.set(profile.flagCode.toUpperCase(), canonical);
      }

      this.numericCache.set(canonical, numeric);
      this.numericCache.set(profile.code.toUpperCase(), numeric);
      this.numericCache.set(numeric.toString(), numeric);
    }
  }
}

export class NationIdResolver {
  public static resolveCanonicalId(codeOrId: string | number): string {
    if (!codeOrId && codeOrId !== 0) return "";

    const clean = codeOrId.toString().trim().toUpperCase();
    const cached = NationIdCacheRegistry.canonicalCache.get(clean);
    if (cached) return cached;

    let profile = findCountryProfileByCode(clean);
    if (!profile) {
      const rawNum = clean.replace("NATION_", "");
      const numericId = parseInt(rawNum, 10);
      if (!isNaN(numericId)) {
        profile = findCountryProfileById(numericId);
      }
    }

    if (profile) {
      const result = `NATION_${profile.code.toUpperCase()}`;
      NationIdCacheRegistry.canonicalCache.set(clean, result);
      return result;
    }

    if (clean.startsWith("NATION_")) {
      return clean;
    }

    const fallback = `NATION_${clean}`;
    NationIdCacheRegistry.canonicalCache.set(clean, fallback);
    return fallback;
  }

  public static resolveNumericId(codeOrId: string | number): number {
    if (typeof codeOrId === "number") {
      return codeOrId;
    }
    if (!codeOrId) return 0;

    const clean = codeOrId.toString().trim().toUpperCase();
    const cached = NationIdCacheRegistry.numericCache.get(clean);
    if (cached !== undefined) return cached;

    const rawNum = clean.replace("NATION_", "");
    const parsedDirect = parseInt(rawNum, 10);
    if (!isNaN(parsedDirect) && parsedDirect > 0 && parsedDirect < 255) {
      const checkProfile = findCountryProfileById(parsedDirect);
      if (checkProfile) return checkProfile.id ?? parsedDirect;
    }

    const profile =
      findCountryProfileByCode(clean) || findCountryProfileById(clean);
    if (profile && profile.id) {
      NationIdCacheRegistry.numericCache.set(clean, profile.id);
      return profile.id;
    }

    return isNaN(parsedDirect) ? 0 : parsedDirect;
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
