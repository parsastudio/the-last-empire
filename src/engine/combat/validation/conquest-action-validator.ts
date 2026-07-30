import { GameState } from "@/domain/game/game-state.schema";
import { GameAction, AttackAction } from "@/domain/game/action.schema";
import { BattleValidator } from "@/engine/combat/validation/battle-validator";
import { GridState } from "@/engine/combat/state/grid-state";
import { GameError } from "@/domain/shared/game-error";

export class ConquestActionValidator {
  private validator = new BattleValidator();

  public validateAttack(state: GameState, action: GameAction): void {
    if (action.type !== "ATTACK") {
      return;
    }

    const attackAction = action as AttackAction;
    const gridState: GridState =
      (state as { gridState?: GridState }).gridState || new GridState();
    const allCells = gridState.getAllCells();

    let x = 0;
    let y = 0;

    if (attackAction.targetCoordinate) {
      x = attackAction.targetCoordinate.x;
      y = attackAction.targetCoordinate.y;
    } else if (
      attackAction.targetX !== undefined &&
      attackAction.targetY !== undefined
    ) {
      x = attackAction.targetX;
      y = attackAction.targetY;
    } else {
      x = Math.floor(attackAction.infantry % 1024);
      y = Math.floor(attackAction.airForce % 512);
    }

    const scaledX = Math.floor(x / 4);
    const scaledY = Math.floor(y / 4);

    const targetPixel = {
      x: scaledX,
      y: scaledY,
    };

    const isValid = this.validator.validateAttackOpportunity(
      action.nationId,
      targetPixel,
      allCells,
    );

    if (!isValid) {
      throw new GameError(
        "INVALID_ACTION",
        "Attack origin base is too small or isolated to launch a major invasion",
      );
    }
  }
}
