import { ActionHandler } from "../action-handler";
import { ActivateAbilityActionHandler } from "../activate-ability-action-handler";
import { FundProxyInfluenceActionHandler } from "../fund-proxy-influence-action-handler";
import { UnlockDoctrineActionHandler } from "../unlock-doctrine-action-handler";
import { AntiCorruptionActionHandler } from "../anti-corruption-action-handler";
import { InvestDiplomacyActionHandler } from "../invest-diplomacy-action-handler";

export function getPoliticsActionHandlers(): [string, ActionHandler][] {
  return [
    ["ACTIVATE_ABILITY", new ActivateAbilityActionHandler()],
    ["FUND_PROXY_INFLUENCE", new FundProxyInfluenceActionHandler()],
    ["UNLOCK_DOCTRINE", new UnlockDoctrineActionHandler()],
    ["ANTI_CORRUPTION_DRIVE", new AntiCorruptionActionHandler()],
    ["INVEST_DIPLOMACY", new InvestDiplomacyActionHandler()],
  ];
}
