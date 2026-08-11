import { TurnLogEntry, TurnLogLevel } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";

export type { Nation } from "@/domain/nation/nation.schema";
export type { AIPersonalityType } from "@/domain/ai/ai.schema";

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

export class TurnLogBuilder {
  public static createLogEntry(
    turn: number,
    sourceNationId: string,
    level: TurnLogLevel,
    message: string,
  ): TurnLogEntry {
    const canonical = CountryRegistry.resolveCanonicalId(sourceNationId);
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
