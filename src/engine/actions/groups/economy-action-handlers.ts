import { ActionHandler } from "../action-handler";
import { TaxActionHandler } from "../tax-action-handler";
import { SetTariffRateActionHandler } from "../set-tariff-rate-action-handler";
import { UpgradeIndustrialActionHandler } from "../upgrade-industrial-action-handler";
import { InvestInfrastructureActionHandler } from "../invest-infrastructure-action-handler";
import { TradeActionHandler } from "../trade-action-handler";
import { RepayDebtActionHandler } from "../repay-debt-action-handler";
import { ImfLoanActionHandler } from "../imf-loan-action-handler";

export function getEconomyActionHandlers(): [string, ActionHandler][] {
  return [
    ["SET_TAX_RATE", new TaxActionHandler()],
    ["SET_TARIFF_RATE", new SetTariffRateActionHandler()],
    ["UPGRADE_INDUSTRIAL_LEVEL", new UpgradeIndustrialActionHandler()],
    ["INVEST_INFRASTRUCTURE", new InvestInfrastructureActionHandler()],
    ["TRADE_RESOURCES", new TradeActionHandler()],
    ["REPAY_DEBT", new RepayDebtActionHandler()],
    ["REQUEST_LOAN", new ImfLoanActionHandler()],
  ];
}
