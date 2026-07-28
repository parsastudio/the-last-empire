import { NationId } from "@/domain/shared/primitives";

let serverFallbackNationId: NationId = "IRN";

export class PlayerSessionManager {
  private readonly storageKey = "test6_human_nation_id";

  public getPlayerNationId(): NationId {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) return stored;
    }
    return serverFallbackNationId;
  }

  public setPlayerNationId(nationId: NationId): void {
    serverFallbackNationId = nationId;
    if (typeof window !== "undefined") {
      localStorage.setItem(this.storageKey, nationId);
    }
  }

  public clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.storageKey);
    }
  }
}
