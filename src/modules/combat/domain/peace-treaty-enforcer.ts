import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class PeaceTreatyEnforcer {
  private readonly defaultTreatyTurns = 10;

  public establishPeace(nationA: Nation, nationBId: string): Nation {
    const relation = nationA.relations[nationBId];
    if (!relation) {
      return nationA;
    }

    return {
      ...nationA,
      relations: {
        ...nationA.relations,
        [nationBId]: {
          ...relation,
          stance: "PEACE",
          treatyTurnsRemaining: this.defaultTreatyTurns,
        },
      },
    };
  }

  public penalizeTreatyViolation(violator: Nation): Nation {
    const reputationPenalty = 40;
    const stabilityPenalty = 15;

    return {
      ...violator,
      reputation: Math.max(-100, violator.reputation - reputationPenalty),
      government: {
        ...violator.government,
        stability: Math.max(
          0,
          violator.government.stability - stabilityPenalty,
        ),
      },
    };
  }
}
