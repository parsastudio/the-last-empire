import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, AttackAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";
import { FastTransitCalculator } from "@/engine/combat/routing/fast-transit-calculator";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";

export class AttackActionValidator implements ActionValidator {
  private transitCalculator = new FastTransitCalculator();

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
      const targetPixel = attackAction.targetCoordinate ?? {
        x: attackAction.targetX ?? 0,
        y: attackAction.targetY ?? 0,
      };

      const gridState = GridStateProvider.getInstance();
      const allCells = gridState.getAllCells();

      if (allCells.length > 0) {
        const transit = this.transitCalculator.calculateTransit(
          action.nationId,
          attackAction.targetNationId,
          targetPixel,
          allCells,
        );

        const baseCostPerKm = transit.isLandAttack ? 15 : 45;
        const logisticsCost = Math.floor(transit.distanceInKm * baseCostPerKm);

        if (sourceNation.treasury < logisticsCost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            `Insufficient treasury to fund military attack logistics. Required: $${logisticsCost.toLocaleString("fa-IR")}`,
          );
        }
      }
    }
  }
}
