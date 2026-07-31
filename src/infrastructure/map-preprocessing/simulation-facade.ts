import { GameState } from "@/domain/game/game-state.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GameStateInitializer } from "./game-state-initializer";
import { PlayerSessionManager } from "./player-session-manager";

export class SimulationFacade {
  private sessionManager = new PlayerSessionManager();
  private initializer = new GameStateInitializer();

  public selectPlayerNation(
    nationId: string,
    governmentType?: GovernmentType | string,
  ): GameState {
    this.sessionManager.setPlayerNationId(nationId);
    const gridState = GridStateProvider.getInstance();
    return this.initializer.initializeSimulationForNation(
      nationId,
      gridState,
      governmentType,
    );
  }
}
