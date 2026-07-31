import "server-only";
import { GameEngine } from "@/engine/game-engine";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GridLoaderService } from "@/engine/combat/state/grid-loader.service";

class ServerGameSessionStore {
  private static instance: ServerGameSessionStore;

  public static getInstance(): ServerGameSessionStore {
    if (!ServerGameSessionStore.instance) {
      ServerGameSessionStore.instance = new ServerGameSessionStore();
    }
    return ServerGameSessionStore.instance;
  }

  public initSession(gameId: string, initialState: GameState): GameEngine {
    const gridState = GridStateProvider.getInstance();
    GridLoaderService.ensureGridLoaded(gridState);
    return new GameEngine(initialState);
  }

  public getEngine(_gameId: string): GameEngine | undefined {
    return undefined;
  }

  public dispatchAction(
    _gameId: string,
    action: GameAction,
    currentState?: GameState,
  ): ActionResult | null {
    if (!currentState) {
      return null;
    }
    const gridState = GridStateProvider.getInstance();
    GridLoaderService.ensureGridLoaded(gridState);

    const engine = new GameEngine(currentState);
    return engine.dispatchAction(action);
  }

  public advanceTurn(
    _gameId: string,
    currentState?: GameState,
  ): GameState | null {
    if (!currentState) {
      return null;
    }
    const gridState = GridStateProvider.getInstance();
    GridLoaderService.ensureGridLoaded(gridState);

    const engine = new GameEngine(currentState);
    return engine.nextTurn();
  }
}

export const serverGameSessionStore = ServerGameSessionStore.getInstance();
