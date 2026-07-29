import { GameState } from "@/domain/game/game-state.schema";
import {
  GameAction,
  ChangeGovernmentAction,
} from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";

export class GovernmentChangeValidator implements ActionValidator {
  public supports(actionType: string): boolean {
    return actionType === "CHANGE_GOVERNMENT";
  }

  public validate(state: GameState, action: GameAction): void {
    const govAction = action as ChangeGovernmentAction;
    const sourceNation = state.nations[action.nationId];

    if (!sourceNation) {
      throw new GameError("NATION_NOT_FOUND", "Nation does not exist");
    }

    if (sourceNation.government.type === govAction.newGovernment) {
      throw new GameError(
        "INVALID_GOVERNMENT_CHANGE",
        "Nation is already under this government system",
      );
    }

    if (sourceNation.government.turnsInPower < 15) {
      throw new GameError(
        "INVALID_GOVERNMENT_CHANGE",
        `Regime change locked. Must wait at least 15 turns between changes. Current turns in power: ${sourceNation.government.turnsInPower}`,
      );
    }

    const changeCost = Math.min(250000, Math.floor(sourceNation.gdp * 0.05));

    if (sourceNation.treasury < changeCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        `Insufficient treasury for regime referendum. Required: ${changeCost}`,
      );
    }
  }
}
