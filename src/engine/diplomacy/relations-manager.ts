import type { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";

export class RelationsManager {
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

  public improveRelations(
    nationA: Nation,
    targetId: string,
    cost = 10000,
  ): Nation {
    if (nationA.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough treasury to improve relations",
      );
    }

    const relation = nationA.relations[targetId];
    if (!relation) {
      throw new GameError(
        "NATION_NOT_FOUND",
        `Target nation ${targetId} relation not found`,
      );
    }

    const updatedOpinion = Math.min(100, relation.opinion + 15);

    return {
      ...nationA,
      treasury: nationA.treasury - cost,
      relations: {
        ...nationA.relations,
        [targetId]: {
          ...relation,
          opinion: updatedOpinion,
        },
      },
    };
  }

  public sendInsult(nationA: Nation, targetId: string): Nation {
    const relation = nationA.relations[targetId];
    if (!relation) {
      throw new GameError(
        "NATION_NOT_FOUND",
        `Target nation ${targetId} relation not found`,
      );
    }

    const updatedOpinion = Math.max(-100, relation.opinion - 30);

    return {
      ...nationA,
      relations: {
        ...nationA.relations,
        [targetId]: {
          ...relation,
          opinion: updatedOpinion,
        },
      },
    };
  }
}
