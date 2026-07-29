import { ActionValidator } from "../validators/action-validator.interface";
import { RecruitUnitValidator } from "../validators/recruit-unit.validator";
import { DisbandUnitValidator } from "../validators/disband-unit.validator";
import { RecruitmentCancelValidator } from "../validators/recruitment-cancel.validator";
import { AttackActionValidator } from "../validators/attack-action.validator";

export function getMilitaryValidators(): ActionValidator[] {
  return [
    new RecruitUnitValidator(),
    new DisbandUnitValidator(),
    new RecruitmentCancelValidator(),
    new AttackActionValidator(),
  ];
}
