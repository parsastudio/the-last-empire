import { ActionValidator } from "../validators/action-validator.interface";
import { TributeAmountValidator } from "../validators/tribute-amount.validator";

export function getDiplomacyValidators(): ActionValidator[] {
  return [new TributeAmountValidator()];
}
