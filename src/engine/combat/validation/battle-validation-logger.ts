import { BattleValidationResult } from "@/engine/combat/validation/battle-validation-result.schema";

export class BattleValidationLogger {
  public logValidationResult(result: BattleValidationResult): void {
    if (!result.isValid) {
      console.warn(`Battle Validation Rejected: ${result.errorMessage}`);
    }
  }
}
