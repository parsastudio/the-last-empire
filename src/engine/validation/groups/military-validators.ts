import { ActionValidator } from "../validators/action-validator.interface";
import { RecruitUnitValidator } from "../validators/recruit-unit.validator";
import { DisbandUnitValidator } from "../validators/disband-unit.validator";
import { RecruitmentCancelValidator } from "../validators/recruitment-cancel.validator";

export function getMilitaryValidators(): ActionValidator[] {
  return [
    new RecruitUnitValidator(),
    new DisbandUnitValidator(),
    new RecruitmentCancelValidator(),
  ];
}
