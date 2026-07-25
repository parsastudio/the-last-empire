import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { TaxActionHandler } from "@/engine/actions/tax-action-handler";
import { GovernmentActionHandler } from "@/engine/actions/government-action-handler";
import { RecruitActionHandler } from "@/engine/actions/recruit-action-handler";
import { DeclareWarActionHandler } from "@/engine/actions/declare-war-action-handler";
import { AttackConquestHandler } from "@/engine/combat/actions/attack-conquest-handler";
import { UpgradeIndustrialActionHandler } from "@/engine/actions/upgrade-industrial-action-handler";
import { InvestInfrastructureActionHandler } from "@/engine/actions/invest-infrastructure-action-handler";
import { TradeActionHandler } from "@/engine/actions/trade-action-handler";
import { DiplomacyActionHandler } from "@/engine/actions/diplomacy-action-handler";
import { RepayDebtActionHandler } from "@/engine/actions/repay-debt-action-handler";
import { ActivateAbilityActionHandler } from "@/engine/actions/activate-ability-action-handler";
import { FundProxyInfluenceActionHandler } from "@/engine/actions/fund-proxy-influence-action-handler";
import { UnlockDoctrineActionHandler } from "@/engine/actions/unlock-doctrine-action-handler";
import { DisbandActionHandler } from "@/engine/actions/disband-action-handler";
import { ImfLoanActionHandler } from "@/engine/actions/imf-loan-action-handler";
import { CancelRecruitmentActionHandler } from "@/engine/actions/cancel-recruitment-action-handler";
import { InvestResearchActionHandler } from "@/engine/actions/invest-research-action-handler";
import { AntiCorruptionActionHandler } from "@/engine/actions/anti-corruption-action-handler";
import { ActionHandler } from "@/engine/actions/action-handler";

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
    this.register("ATTACK", new AttackConquestHandler());
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
