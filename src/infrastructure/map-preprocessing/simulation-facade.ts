import { GameState } from "@/domain/game/game-state.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";
import {
  GameStateInitializer,
  normalizeNationId,
} from "./game-state-initializer";

export const STORAGE_KEYS = {
  HUMAN_NATION_ID: "human_nation_id",
  ACTIVE_GAME: "active_game",
} as const;

let serverFallbackNationId = "NATION_118";

export class PlayerSessionManager {
  private readonly storageKey = STORAGE_KEYS.HUMAN_NATION_ID;

  public getPlayerNationId(): string {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) return normalizeNationId(stored);
    }
    return serverFallbackNationId;
  }

  public setPlayerNationId(nationId: string): void {
    const normalized = normalizeNationId(nationId);
    serverFallbackNationId = normalized;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.storageKey, normalized);
    }
  }
}

export class SimulationFacade {
  private sessionManager = new PlayerSessionManager();
  private initializer = new GameStateInitializer();

  public selectPlayerNation(
    nationId: string,
    governmentType?: GovernmentType | string,
  ): GameState {
    this.sessionManager.setPlayerNationId(nationId);
    return this.initializer.initializeSimulationForNation(
      nationId,
      governmentType,
    );
  }
}
