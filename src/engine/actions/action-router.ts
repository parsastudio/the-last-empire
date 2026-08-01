import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { EconomyActionExecutor } from "@/engine/actions/economy-action-executor";
import { MilitaryActionExecutor } from "@/engine/actions/military-action-executor";
import { PoliticsActionExecutor } from "@/engine/actions/politics-action-executor";
import { GridState } from "@/engine/combat/state/grid-state";

export class ActionRouter {
  public route(
    state: GameState,
    action: GameAction,
    gridState?: GridState,
  ): GameState {
    switch (action.type) {
      case "SET_TAX_RATE":
      case "SET_TARIFF_RATE":
      case "REQUEST_LOAN":
      case "REPAY_DEBT":
      case "INVEST_INFRASTRUCTURE":
      case "UPGRADE_INDUSTRIAL_LEVEL":
      case "TRADE_RESOURCES":
        return EconomyActionExecutor.execute(state, action);

      case "RECRUIT_UNIT":
      case "CANCEL_RECRUITMENT":
      case "DISBAND_UNIT":
      case "INVEST_RESEARCH":
      case "INITIATE_BATTLE":
        return MilitaryActionExecutor.execute(state, action, gridState);

      case "SET_RESEARCH_BUDGET":
      case "ACTIVATE_ABILITY":
      case "UNLOCK_DOCTRINE":
      case "ANTI_CORRUPTION_DRIVE":
      case "INVEST_DIPLOMACY":
      case "FUND_PROXY_INFLUENCE":
      case "DIPLOMATIC_PROPOSAL":
      case "CONFIGURE_AUTO_TRADE":
        return PoliticsActionExecutor.execute(state, action);

      default:
        return state;
    }
  }
}
