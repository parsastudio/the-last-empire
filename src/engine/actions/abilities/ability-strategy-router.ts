import { GameState } from "@/domain/game/game-state.schema";
import { ActivateAbilityAction } from "@/domain/game/action.schema";
import { AbilityHandler } from "./ability-handler.interface";
import { DiplomaticSummitHandler } from "./diplomatic-summit.handler";
import { MartialLawHandler } from "./martial-law.handler";
import { IndustrialMobilizationHandler } from "./industrial-mobilization.handler";
import { RoyalDecreeHandler } from "./royal-decree.handler";
import { WarAlertHandler } from "./war-alert.handler";

export class AbilityStrategyRouter {
  private handlers: AbilityHandler[] = [
    new DiplomaticSummitHandler(),
    new MartialLawHandler(),
    new IndustrialMobilizationHandler(),
    new RoyalDecreeHandler(),
    new WarAlertHandler(),
  ];

  public execute(state: GameState, action: ActivateAbilityAction): GameState {
    for (const handler of this.handlers) {
      if (handler.supports(action.abilityType)) {
        return handler.execute(state, action);
      }
    }
    return state;
  }
}
