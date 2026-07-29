import { ActionValidator } from "../validators/action-validator.interface";
import { TaxRateValidator } from "../validators/tax-rate.validator";
import { LoanRequestValidator } from "../validators/loan-request.validator";
import { TradeActionValidator } from "../validators/trade-action.validator";
import { RepayDebtValidator } from "../validators/repay-debt.validator";

export function getEconomyValidators(): ActionValidator[] {
  return [
    new TaxRateValidator(),
    new LoanRequestValidator(),
    new TradeActionValidator(),
    new RepayDebtValidator(),
  ];
}
