import "server-only";
import { GameEngine } from "@/engine/game-engine";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GridLoaderService } from "@/engine/combat/state/grid-loader.service";
import { GameStateInitializer } from "@/infrastructure/map-preprocessing/game-state-initializer";

export class ServerGameSessionStore {
  private static instance: ServerGameSessionStore;

  public static getInstance(): ServerGameSessionStore {
    if (!ServerGameSessionStore.instance) {
      ServerGameSessionStore.instance = new ServerGameSessionStore();
    }
    return ServerGameSessionStore.instance;
  }

  public processAction(
    gameId: string,
    action: GameAction,
    currentState?: GameState,
  ): ActionResult {
    let state = currentState;
    if (!state) {
      const initializer = new GameStateInitializer();
      state = initializer.initializeSimulationForNation(action.nationId);
      state.gameId = gameId;
    }

    if (action.type === "INITIATE_BATTLE") {
      GridLoaderService.ensureGridLoaded();
    }

    const engine = new GameEngine(state);
    return engine.dispatchAction(action);
  }

  public advanceTurn(
    gameId: string,
    currentState?: GameState,
  ): GameState | null {
    if (!currentState) {
      return null;
    }

    GridLoaderService.ensureGridLoaded();
    const engine = new GameEngine(currentState);
    return engine.nextTurn();
  }

  public getOrInitState(
    gameId: string,
    nationId: string,
    currentState?: GameState,
  ): GameState {
    if (currentState) {
      return currentState;
    }

    const initializer = new GameStateInitializer();
    const initialState = initializer.initializeSimulationForNation(nationId);
    initialState.gameId = gameId;
    return initialState;
  }
}

export const serverGameSessionStore = ServerGameSessionStore.getInstance();
