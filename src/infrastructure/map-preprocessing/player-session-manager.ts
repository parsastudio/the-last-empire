import { normalizeNationId } from "./game-state-initializer";

let serverFallbackNationId = "NATION_118";

export class PlayerSessionManager {
  private readonly storageKey = "test6_human_nation_id";

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

  public clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }
}
