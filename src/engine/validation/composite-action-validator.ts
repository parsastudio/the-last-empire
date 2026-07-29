import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { ActionValidator } from "./validators/action-validator.interface";
import { getEconomyValidators } from "./groups/economy-validators";
import { getMilitaryValidators } from "./groups/military-validators";
import { getPoliticsValidators } from "./groups/politics-validators";
import { getDiplomacyValidators } from "./groups/diplomacy-validators";

export class CompositeActionValidator {
  private validators: ActionValidator[] = [
    ...getEconomyValidators(),
    ...getMilitaryValidators(),
    ...getPoliticsValidators(),
    ...getDiplomacyValidators(),
  ];

  public validate(state: GameState, action: GameAction): void {
    for (const validator of this.validators) {
      if (validator.supports(action.type)) {
        validator.validate(state, action);
      }
    }
  }
}
