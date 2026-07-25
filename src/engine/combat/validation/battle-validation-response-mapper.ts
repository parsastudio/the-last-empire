import { BattleValidationResult } from "@/engine/combat/validation/battle-validation-result.schema";

export class BattleValidationResponseMapper {
  public mapToReadableError(result: BattleValidationResult): string {
    if (result.isValid) {
      return "Strategic attack deployment parameters are valid.";
    }
    return result.errorMessage || "Deployment rejected due to tactical limits.";
  }
}
