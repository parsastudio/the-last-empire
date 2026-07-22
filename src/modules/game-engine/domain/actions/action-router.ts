import type { GameState } from "@/core/types/game-state.types";
import type { GameAction } from "@/core/types/actions.types";
import { ActionHandler } from "./action-handler";
import { TaxActionHandler } from "./tax-action-handler";
import { GovernmentActionHandler } from "./government-action-handler";
import { MilitaryActionHandler } from "./military-action-handler";
import { EconomyActionHandler } from "./economy-action-handler";
import { TradeActionHandler } from "./trade-action-handler";
import { DiplomacyActionHandler } from "./diplomacy-action-handler";

export class ActionRouter {
  private handlers: Record<string, ActionHandler> = {
    SET_TAX_RATE: new TaxActionHandler(),
    CHANGE_GOVERNMENT: new GovernmentActionHandler(),
    RECRUIT_UNIT: new MilitaryActionHandler(),
    DECLARE_WAR: new MilitaryActionHandler(),
    ATTACK: new MilitaryActionHandler(),
    UPGRADE_INDUSTRIAL_LEVEL: new EconomyActionHandler(),
    INVEST_INFRASTRUCTURE: new EconomyActionHandler(),
    TRADE_RESOURCES: new TradeActionHandler(),
    DIPLOMATIC_PROPOSAL: new DiplomacyActionHandler(),
  };

  public route(state: GameState, action: GameAction): GameState {
    const handler = this.handlers[action.type];
    if (handler) {
      return handler.execute(state, action);
    }
    return state;
  }
}
