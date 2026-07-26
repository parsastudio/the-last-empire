import { NationId } from "@/domain/shared/primitives";

export class PlayerSessionManager {
  private readonly storageKey = "test6_human_nation_id";

  public getPlayerNationId(): NationId | null {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(this.storageKey);
  }

  public setPlayerNationId(nationId: NationId): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(this.storageKey, nationId);
  }

  public clearSession(): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem(this.storageKey);
  }
}
