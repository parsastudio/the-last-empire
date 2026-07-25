import { GameError, GameErrorCode } from "@/domain/shared/game-error";

export class BattleError extends GameError {
  constructor(
    code: GameErrorCode,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(code, message, details);
    this.name = "BattleError";
    Object.setPrototypeOf(this, BattleError.prototype);
  }
}
