import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { ActionValidator } from "./validators/action-validator.interface";
import { TaxRateValidator } from "./validators/tax-rate.validator";
import { RecruitUnitValidator } from "./validators/recruit-unit.validator";
import { ProxyInfluenceValidator } from "./validators/proxy-influence.validator";
import { DoctrineUnlockValidator } from "./validators/doctrine-unlock.validator";
import { DisbandUnitValidator } from "./validators/disband-unit.validator";
import { LoanRequestValidator } from "./validators/loan-request.validator";
import { RecruitmentCancelValidator } from "./validators/recruitment-cancel.validator";
import { AntiCorruptionValidator } from "./validators/anti-corruption.validator";
import { AttackActionValidator } from "./validators/attack-action.validator";
import { TributeAmountValidator } from "./validators/tribute-amount.validator";
import { TradeActionValidator } from "./validators/trade-action.validator";
import { RepayDebtValidator } from "./validators/repay-debt.validator";
import { GovernmentChangeValidator } from "./validators/government-change.validator";
import { ActivateAbilityValidator } from "./validators/activate-ability.validator";

export class CompositeActionValidator {
  private validators: ActionValidator[] = [
    new TaxRateValidator(),
    new RecruitUnitValidator(),
    new ProxyInfluenceValidator(),
    new DoctrineUnlockValidator(),
    new DisbandUnitValidator(),
    new LoanRequestValidator(),
    new RecruitmentCancelValidator(),
    new AntiCorruptionValidator(),
    new AttackActionValidator(),
    new TributeAmountValidator(),
    new TradeActionValidator(),
    new RepayDebtValidator(),
    new GovernmentChangeValidator(),
    new ActivateAbilityValidator(),
  ];

  public validate(state: GameState, action: GameAction): void {
    for (const validator of this.validators) {
      if (validator.supports(action.type)) {
        validator.validate(state, action);
      }
    }
  }
}
