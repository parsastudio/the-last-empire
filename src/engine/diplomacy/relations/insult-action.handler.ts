import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";

export class InsultActionHandler {
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
