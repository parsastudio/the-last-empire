import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { ActionHandler } from "./action-handler";
import { TaxActionHandler } from "./tax-action-handler";
import { GovernmentActionHandler } from "./government-action-handler";
import { MilitaryActionHandler } from "./military-action-handler";
import { EconomyActionHandler } from "./economy-action-handler";
import { TradeActionHandler } from "./trade-action-handler";
import { DiplomacyActionHandler } from "./diplomacy-action-handler";

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
    const militaryHandler = new MilitaryActionHandler();
    const economyHandler = new EconomyActionHandler();

    this.register("SET_TAX_RATE", new TaxActionHandler());
    this.register("CHANGE_GOVERNMENT", new GovernmentActionHandler());
    this.register("RECRUIT_UNIT", militaryHandler);
    this.register("DECLARE_WAR", militaryHandler);
    this.register("ATTACK", militaryHandler);
    this.register("UPGRADE_INDUSTRIAL_LEVEL", economyHandler);
    this.register("INVEST_INFRASTRUCTURE", economyHandler);
    this.register("TRADE_RESOURCES", new TradeActionHandler());
    this.register("DIPLOMATIC_PROPOSAL", new DiplomacyActionHandler());
  }
}
