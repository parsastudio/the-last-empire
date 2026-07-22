import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class PeaceEvaluator {
  public shouldAcceptPeace(proposer: Nation, receiver: Nation): boolean {
    if (receiver.warExhaustion > 60) {
      return true;
    }

    if (receiver.treasury < 1000 && receiver.military.infantry < 50) {
      return true;
    }

    if (proposer.military.infantry > receiver.military.infantry * 3) {
      return true;
    }

    return false;
  }
}
