import { BattleError } from "@/engine/combat/validation/battle-error";

export class BattleValidationException extends BattleError {
  public getTacticalReasonCode(): string {
    return "TACTICAL_LIMITATION";
  }
}
