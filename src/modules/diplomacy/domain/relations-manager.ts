import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { RelationProfile } from "@/modules/diplomacy/schemas/diplomacy.schema";
import { GameError } from "@/core/errors/game-error";

export class RelationsManager {
  public updateOpinion(
    profile: RelationProfile,
    delta: number,
  ): RelationProfile {
    const newOpinion = Math.max(-100, Math.min(100, profile.opinion + delta));
    return {
      ...profile,
      opinion: newOpinion,
    };
  }

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

    const updatedRelation = this.updateOpinion(relation, 5);

    return {
      ...nationA,
      treasury: nationA.treasury - cost,
      relations: {
        ...nationA.relations,
        [targetId]: updatedRelation,
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

    const updatedRelation = this.updateOpinion(relation, -25);

    return {
      ...nationA,
      relations: {
        ...nationA.relations,
        [targetId]: updatedRelation,
      },
    };
  }
}
