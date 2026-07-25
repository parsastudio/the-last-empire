import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";

export class DiplomaticMatrixGenerator {
  public generateBlankRelations(
    nationsList: string[],
  ): Record<string, RelationProfile> {
    const relations: Record<string, RelationProfile> = {};
    for (const targetId of nationsList) {
      relations[targetId] = {
        targetNationId: targetId,
        stance: "PEACE" as const,
        opinion: 0,
        tributePerTurn: 0,
        militaryAccess: false,
        intelLevel: 0,
        coolOffTurnsRemaining: 0,
      };
    }
    return relations;
  }
}
