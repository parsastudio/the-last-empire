import "server-only";
import { GameEngine } from "@/engine/game-engine";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, ActionResult } from "@/domain/game/action.schema";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { GridLoaderService } from "@/engine/combat/state/grid-loader.service";

class ServerGameSessionStore {
  private static instance: ServerGameSessionStore;
  private engines = new Map<string, GameEngine>();

  public static getInstance(): ServerGameSessionStore {
    if (!ServerGameSessionStore.instance) {
      ServerGameSessionStore.instance = new ServerGameSessionStore();
    }
    return ServerGameSessionStore.instance;
  }

  public initSession(gameId: string, initialState: GameState): GameEngine {
    const engine = new GameEngine(initialState);
    this.engines.set(gameId, engine);
    return engine;
  }

  public getEngine(gameId: string): GameEngine | undefined {
    return this.engines.get(gameId);
  }

  public dispatchAction(
    gameId: string,
    action: GameAction,
    currentState?: GameState,
  ): ActionResult | null {
    let engine = this.engines.get(gameId);

    if (currentState) {
      if (
        !engine ||
        engine.getState().currentTurn !== currentState.currentTurn
      ) {
        engine = this.initSession(gameId, currentState);
      }
    }

    if (!engine) {
      return null;
    }

    if (action.type === "INITIATE_BATTLE") {
      const gridState = GridStateProvider.getInstance();
      GridLoaderService.ensureGridLoaded(gridState);
    }

    return engine.dispatchAction(action);
  }

  public advanceTurn(
    gameId: string,
    currentState?: GameState,
  ): GameState | null {
    let engine = this.engines.get(gameId);

    if (currentState) {
      if (
        !engine ||
        engine.getState().currentTurn !== currentState.currentTurn
      ) {
        engine = this.initSession(gameId, currentState);
      }
    }

    if (!engine) {
      return null;
    }

    const gridState = GridStateProvider.getInstance();
    GridLoaderService.ensureGridLoaded(gridState);
    return engine.nextTurn();
  }
}

export const serverGameSessionStore = ServerGameSessionStore.getInstance();
