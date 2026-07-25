import { Nation } from "@/domain/nation/nation.schema";

export class GovernmentFrictionCalculator {
  public calculateGovernmentFriction(nationA: Nation, nationB: Nation): number {
    const typeA = nationA.government.type;
    const typeB = nationB.government.type;

    if (typeA === typeB) {
      return 1;
    }

    if (
      (typeA === "DEMOCRACY" && typeB === "FASCISM") ||
      (typeA === "FASCISM" && typeB === "DEMOCRACY")
    ) {
      return -3;
    }

    if (
      (typeA === "DEMOCRACY" && typeB === "COMMUNISM") ||
      (typeA === "COMMUNISM" && typeB === "DEMOCRACY")
    ) {
      return -2;
    }

    return 0;
  }
}
