import type { Nation } from "@/domain/nation/nation.schema";

export class PeaceTreatyEnforcer {
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
          coolOffTurnsRemaining: 0,
        },
      },
    };
  }

  public penalizeTreatyViolation(violator: Nation): Nation {
    const reputationPenalty = 40;
    const stabilityPenalty = 15;

    return {
      ...violator,
      globalReputation: Math.max(
        -100,
        violator.globalReputation - reputationPenalty,
      ),
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
