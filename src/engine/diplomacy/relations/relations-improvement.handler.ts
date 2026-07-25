import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";

export class RelationsImprovementHandler {
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
}
