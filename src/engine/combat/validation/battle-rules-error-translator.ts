export class BattleRulesErrorTranslator {
  public translateCode(code: string): string {
    switch (code) {
      case "INSUFFICIENT_BASE_SIZE":
        return "Military operation rejected: Base size is below the 50,000 sq km strategic capability requirement.";
      case "MARITIME_RANGE_EXCEEDED":
        return "Military operation rejected: Target exceeds maximum maritime range limit.";
      default:
        return "Military operation rejected due to tactical validation constraints.";
    }
  }
}
