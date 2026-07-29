import { GameState } from "@/domain/game/game-state.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GameStateInitializer } from "./game-state-initializer";
import { PlayerSessionManager } from "./player-session-manager";
import { GameEngine } from "@/engine/game-engine";

export class SimulationFacade {
  private sessionManager = new PlayerSessionManager();
  private initializer = new GameStateInitializer();

  public getActiveSessionState(): GameState | null {
    const playerNationId = this.sessionManager.getPlayerNationId();
    if (!playerNationId) {
      return null;
    }
    const gridState = GridStateProvider.getInstance();
    return this.initializer.initializeSimulationForNation(
      playerNationId,
      gridState,
    );
  }

  public advanceTurn(): GameState | null {
    const playerNationId = this.sessionManager.getPlayerNationId();
    if (!playerNationId) {
      return null;
    }
    const gridState = GridStateProvider.getInstance();
    const baseState = this.initializer.initializeSimulationForNation(
      playerNationId,
      gridState,
    );
    const engine = new GameEngine(baseState);
    return engine.nextTurn();
  }

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
