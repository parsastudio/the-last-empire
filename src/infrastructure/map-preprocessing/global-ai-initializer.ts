import { Nation } from "@/domain/nation/nation.schema";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { NationProfileAssigner } from "@/infrastructure/map-preprocessing/nation-profile-assigner";
import { FinalMapManifest } from "@/infrastructure/map-preprocessing/final/final-manifest-builder";

export class DiplomaticMatrixGenerator {
  public generateBlankRelations(
    nationsList: string[],
  ): Record<string, RelationProfile> {
    const relations: Record<string, RelationProfile> = {};
    for (const targetId of nationsList) {
      relations[targetId] = {
        targetNationId: targetId,
        stance: "NORMAL_DIPLOMACY" as const,
        opinion: 0,
        coolOffTurnsRemaining: 0,
      };
    }
    return relations;
  }
}

export class GlobalAiInitializer {
  private profileAssigner = new NationProfileAssigner();
  private relationsGenerator = new DiplomaticMatrixGenerator();

  public initializeFromManifest(
    manifest: FinalMapManifest,
    humanNationId: string,
    humanGovType?: string,
  ): Record<string, Nation> {
    const nations: Record<string, Nation> = {};
    const manifestItems = manifest.nations || [];
    const allIds = manifestItems.map((item) => item.id);

    for (const item of manifestItems) {
      const isHuman = item.id === humanNationId;
      const govToApply = isHuman ? humanGovType : undefined;
      const nation = this.profileAssigner.buildNationFromManifest(
        item,
        isHuman,
        govToApply,
      );

      const relativeList = allIds.filter((id) => id !== item.id);
      nation.relations =
        this.relationsGenerator.generateBlankRelations(relativeList);

      nations[item.id] = nation;
    }

    return nations;
  }

  public initializeAllNations(
    detectedNationsList: string[],
    humanNationId: string,
    humanGovType?: string,
    manifest?: FinalMapManifest | null,
  ): Record<string, Nation> {
    if (manifest && manifest.nations && manifest.nations.length > 0) {
      return this.initializeFromManifest(manifest, humanNationId, humanGovType);
    }

    const nations: Record<string, Nation> = {};
    for (const id of detectedNationsList) {
      const isHuman = id === humanNationId;
      const govToApply = isHuman ? humanGovType : undefined;
      const nation = this.profileAssigner.buildStartingNation(
        id,
        isHuman,
        govToApply,
      );

      const relativeList = detectedNationsList.filter((nId) => nId !== id);
      nation.relations =
        this.relationsGenerator.generateBlankRelations(relativeList);

      nations[id] = nation;
    }

    return nations;
  }
}
