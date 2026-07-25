import { GameState } from "@/domain/game/game-state.schema";

export class PeaceTracker {
  public updatePeacefulTurns(state: GameState): number {
    const activeWars = Object.values(state.nations).some((n) =>
      Object.values(n.relations).some((r) => r.stance === "WAR"),
    );

    let peacefulCount = state.peacefulTurnsCount ?? 0;
    if (!activeWars) {
      peacefulCount += 1;
    } else {
      peacefulCount = 0;
    }

    return peacefulCount;
  }
}
