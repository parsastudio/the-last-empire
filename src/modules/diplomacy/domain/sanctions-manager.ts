import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class SanctionsManager {
  public applyEmbargo(nationA: Nation, targetId: string): Nation {
    const relation = nationA.relations[targetId];
    if (!relation) {
      return nationA;
    }

    return {
      ...nationA,
      relations: {
        ...nationA.relations,
        [targetId]: {
          ...relation,
          stance: "EMBARGO",
          embargoActive: true,
        },
      },
    };
  }

  public liftEmbargo(nationA: Nation, targetId: string): Nation {
    const relation = nationA.relations[targetId];
    if (!relation) {
      return nationA;
    }

    return {
      ...nationA,
      relations: {
        ...nationA.relations,
        [targetId]: {
          ...relation,
          stance: "PEACE",
          embargoActive: false,
        },
      },
    };
  }

  public calculateEmbargoTradePenalty(nation: Nation): number {
    const activeEmbargoes = Object.values(nation.relations).filter(
      (r) => r.embargoActive,
    ).length;
    return activeEmbargoes * 0.08;
  }
}
