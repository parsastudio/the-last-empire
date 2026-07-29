import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, AttackAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { GeographyDistanceCalculator } from "@/engine/economy/geography-distance-calculator";
import { ActionValidator } from "./action-validator.interface";

export class AttackActionValidator implements ActionValidator {
  private distanceCalculator = new GeographyDistanceCalculator();

  public supports(actionType: string): boolean {
    return actionType === "ATTACK";
  }

  public validate(state: GameState, action: GameAction): void {
    const attackAction = action as AttackAction;
    const totalUnits =
      attackAction.infantry + attackAction.airForce + attackAction.droneMissile;
    if (totalUnits <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Must deploy at least one military unit to launch an attack",
      );
    }
    const sourceNation = state.nations[action.nationId];
    if (sourceNation) {
      const relation = sourceNation.relations[attackAction.targetNationId];
      if (!relation || relation.stance !== "WAR") {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot attack a nation without first being in a state of war",
        );
      }
      const distance = this.distanceCalculator.calculateDistance(
        sourceNation.id,
        attackAction.targetNationId,
        state.nations,
      );
      if (distance > 6) {
        throw new GameError(
          "INVALID_ACTION",
          "Target is geographically unreachable for direct attack. Max attack range is 6.",
        );
      }

      const internalDistanceFactor = Math.sqrt(
        sourceNation.geography.territorySize || 100,
      );
      const infrastructureBonus =
        1.0 + sourceNation.geography.infrastructureLevel * 0.15;
      const estimatedLogisticsCost = Math.floor(
        (12000 * internalDistanceFactor) / infrastructureBonus,
      );

      if (sourceNation.treasury < estimatedLogisticsCost) {
        throw new GameError(
          "INSUFFICIENT_FUNDS",
          `Insufficient treasury to fund military attack logistics. Required: $${estimatedLogisticsCost.toLocaleString("fa-IR")}`,
        );
      }
    }
  }
}
