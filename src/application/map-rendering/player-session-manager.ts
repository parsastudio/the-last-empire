import { NationId } from "@/domain/shared/primitives";
import { normalizeNationId } from "./game-state-initializer";

let serverFallbackNationId: NationId = "NATION_118";

export class PlayerSessionManager {
  private readonly storageKey = "test6_human_nation_id";

  public getPlayerNationId(): NationId {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) return normalizeNationId(stored);
    }
    return serverFallbackNationId;
  }

  public setPlayerNationId(nationId: NationId): void {
    const normalized = normalizeNationId(nationId);
    serverFallbackNationId = normalized;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.storageKey, normalized);
    }
  }

  public clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }
}
