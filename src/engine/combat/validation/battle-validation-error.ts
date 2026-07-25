import { BattleError } from "@/engine/combat/validation/battle-error";

export class BattleValidationError extends BattleError {
  public translateErrorToMessage(reasonCode: string): string {
    switch (reasonCode) {
      case "BASE_TOO_SMALL":
        return "Operational base is below the 50,000 sq km strategic capability requirement.";
      case "TARGET_OUT_OF_REACH":
        return "Target region exceeds the maximum logistical maritime range.";
      default:
        return "Battle validation failed due to unspecified tactical limitations.";
    }
  }
}
