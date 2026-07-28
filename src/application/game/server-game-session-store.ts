import "server-only";
import { GameEngine } from "@/engine/game-engine";
import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, ActionResult } from "@/domain/game/action.schema";

class ServerGameSessionStore {
  private static instance: ServerGameSessionStore;
  private engines: Map<string, GameEngine> = new Map();

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
  ): ActionResult | null {
    const engine = this.engines.get(gameId);
    if (!engine) {
      return null;
    }
    return engine.dispatchAction(action);
  }

  public advanceTurn(gameId: string): GameState | null {
    const engine = this.engines.get(gameId);
    if (!engine) {
      return null;
    }
    return engine.nextTurn();
  }
}

export const serverGameSessionStore = ServerGameSessionStore.getInstance();
