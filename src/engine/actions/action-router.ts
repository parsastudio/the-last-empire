import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { ActionHandler } from "@/engine/actions/action-handler";
import { getEconomyActionHandlers } from "./groups/economy-action-handlers";
import { getMilitaryActionHandlers } from "./groups/military-action-handlers";
import { getPoliticsActionHandlers } from "./groups/politics-action-handlers";
import { getDiplomacyActionHandlers } from "./groups/diplomacy-action-handlers";

export class ActionRouter {
  private handlers: Map<string, ActionHandler> = new Map();

  constructor() {
    this.registerDefaultHandlers();
  }

  public register(actionType: string, handler: ActionHandler): void {
    this.handlers.set(actionType, handler);
  }

  public route(state: GameState, action: GameAction): GameState {
    const handler = this.handlers.get(action.type);
    if (handler) {
      return handler.execute(state, action);
    }
    return state;
  }

  private registerDefaultHandlers(): void {
    const allGroups = [
      ...getEconomyActionHandlers(),
      ...getMilitaryActionHandlers(),
      ...getPoliticsActionHandlers(),
      ...getDiplomacyActionHandlers(),
    ];

    for (const [actionType, handler] of allGroups) {
      this.register(actionType, handler);
    }
  }
}
