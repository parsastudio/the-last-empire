import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { TaxActionHandler } from "./tax-action-handler";
import { GovernmentActionHandler } from "./government-action-handler";
import { RecruitActionHandler } from "./recruit-action-handler";
import { DeclareWarActionHandler } from "./declare-war-action-handler";
import { AttackActionHandler } from "./attack-action-handler";
import { UpgradeIndustrialActionHandler } from "./upgrade-industrial-action-handler";
import { InvestInfrastructureActionHandler } from "./invest-infrastructure-action-handler";
import { TradeActionHandler } from "./trade-action-handler";
import { DiplomacyActionHandler } from "./diplomacy-action-handler";
import { RepayDebtActionHandler } from "./repay-debt-action-handler";
import { ActivateAbilityActionHandler } from "./activate-ability-action-handler";
import { FundProxyInfluenceActionHandler } from "./fund-proxy-influence-action-handler";
import { UnlockDoctrineActionHandler } from "./unlock-doctrine-action-handler";
import { DisbandActionHandler } from "./disband-action-handler";
import { ImfLoanActionHandler } from "./imf-loan-action-handler";
import { CancelRecruitmentActionHandler } from "./cancel-recruitment-action-handler";
import { InvestResearchActionHandler } from "./invest-research-action-handler";
import { AntiCorruptionActionHandler } from "./anti-corruption-action-handler";
import type { ActionHandler } from "./action-handler";

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
    this.register("SET_TAX_RATE", new TaxActionHandler());
    this.register("CHANGE_GOVERNMENT", new GovernmentActionHandler());
    this.register("RECRUIT_UNIT", new RecruitActionHandler());
    this.register("DECLARE_WAR", new DeclareWarActionHandler());
    this.register("ATTACK", new AttackActionHandler());
    this.register(
      "UPGRADE_INDUSTRIAL_LEVEL",
      new UpgradeIndustrialActionHandler(),
    );
    this.register(
      "INVEST_INFRASTRUCTURE",
      new InvestInfrastructureActionHandler(),
    );
    this.register("TRADE_RESOURCES", new TradeActionHandler());
    this.register("DIPLOMATIC_PROPOSAL", new DiplomacyActionHandler());
    this.register("REPAY_DEBT", new RepayDebtActionHandler());
    this.register("ACTIVATE_ABILITY", new ActivateAbilityActionHandler());
    this.register(
      "FUND_PROXY_INFLUENCE",
      new FundProxyInfluenceActionHandler(),
    );
    this.register("UNLOCK_DOCTRINE", new UnlockDoctrineActionHandler());
    this.register("DISBAND_UNIT", new DisbandActionHandler());
    this.register("REQUEST_LOAN", new ImfLoanActionHandler());
    this.register("CANCEL_RECRUITMENT", new CancelRecruitmentActionHandler());
    this.register("INVEST_RESEARCH", new InvestResearchActionHandler());
    this.register("ANTI_CORRUPTION_DRIVE", new AntiCorruptionActionHandler());
  }
}
