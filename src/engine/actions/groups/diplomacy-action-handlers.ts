import { ActionHandler } from "../action-handler";
import { DiplomacyActionHandler } from "../diplomacy-action-handler";

export function getDiplomacyActionHandlers(): [string, ActionHandler][] {
  return [["DIPLOMATIC_PROPOSAL", new DiplomacyActionHandler()]];
}
