export type GameErrorCode =
  | "INSUFFICIENT_FUNDS"
  | "INSUFFICIENT_RESOURCES"
  | "INVALID_ACTION"
  | "NATION_NOT_FOUND"
  | "PROVINCE_NOT_FOUND"
  | "UNAUTHORIZED"
  | "SELLER_NOT_FOUND"
  | "DIPLOMATIC_TENSION"
  | "GEOPOLITICAL_REACH_DENIED"
  | "INVALID_TARGET"
  | "GAME_OVER"
  | "EXECUTION_FAILED"
  | "UNKNOWN_ACTION";

export class GameError extends Error {
  public readonly code: GameErrorCode;

  constructor(code: GameErrorCode, message: string) {
    super(message);
    this.name = "GameError";
    this.code = code;
    Object.setPrototypeOf(this, GameError.prototype);
  }
}
