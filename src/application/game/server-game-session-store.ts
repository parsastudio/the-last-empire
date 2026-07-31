import "server-only";
import { GameEngine } from "@/engine/game-engine";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GridLoaderService } from "@/engine/combat/state/grid-loader.service";

interface GlobalSessionStore {
  engines?: Map<string, GameEngine>;
}

const globalStore = globalThis as unknown as GlobalSessionStore;
if (!globalStore.engines) {
  globalStore.engines = new Map<string, GameEngine>();
}

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

    const engine = new GameEngine(initialState);
    globalStore.engines!.set(gameId, engine);
    return engine;
  }

  public getEngine(gameId: string): GameEngine | undefined {
    return globalStore.engines!.get(gameId);
  }

  public dispatchAction(
    gameId: string,
    action: GameAction,
  ): ActionResult | null {
    const engine = globalStore.engines!.get(gameId);
    if (!engine) {
      return null;
    }
    const gridState = GridStateProvider.getInstance();
    GridLoaderService.ensureGridLoaded(gridState);

    return engine.dispatchAction(action);
  }

  public advanceTurn(gameId: string): GameState | null {
    const engine = globalStore.engines!.get(gameId);
    if (!engine) {
      return null;
    }
    const gridState = GridStateProvider.getInstance();
    GridLoaderService.ensureGridLoaded(gridState);

    return engine.nextTurn();
  }
}

export const serverGameSessionStore = ServerGameSessionStore.getInstance();
