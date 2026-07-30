import { ActionHandler } from "../action-handler";
import { RecruitActionHandler } from "../recruit-action-handler";
import { DisbandActionHandler } from "../disband-action-handler";
import { CancelRecruitmentActionHandler } from "../cancel-recruitment-action-handler";
import { InvestResearchActionHandler } from "../invest-research-action-handler";

export function getMilitaryActionHandlers(): [string, ActionHandler][] {
  return [
    ["RECRUIT_UNIT", new RecruitActionHandler()],
    ["DISBAND_UNIT", new DisbandActionHandler()],
    ["CANCEL_RECRUITMENT", new CancelRecruitmentActionHandler()],
    ["INVEST_RESEARCH", new InvestResearchActionHandler()],
  ];
}
