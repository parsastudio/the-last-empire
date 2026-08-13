import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { NationProfileAssigner } from "@/infrastructure/map-preprocessing/nation-profile-assigner";
import {
  FinalMapManifest,
  FinalManifestNation,
} from "@/infrastructure/map-preprocessing/final/final-manifest-builder";
import { RankManager } from "@/engine/politics/rank-manager";

type RelationProfile = Nation["relations"][string];

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
  ): { nations: Record<string, Nation>; provinces: Record<string, Province> } {
    const nations: Record<string, Nation> = {};
    const provinces: Record<string, Province> = {};

    const manifestProvinces = manifest.provinces || [];
    const manifestItems: FinalManifestNation[] = manifest.nations || [];
    const allIds: string[] = manifestItems.map(
      (item: FinalManifestNation) => item.id,
    );

    for (const pItem of manifestProvinces) {
      provinces[pItem.provinceId.toString()] = {
        provinceId: pItem.provinceId,
        nameFa: pItem.nameFa,
        countryNumericId: pItem.countryNumericId,
        ownerNationId: pItem.countryId,
        pixelCount: pItem.pixelCount,
        hasSeaAccess: pItem.hasSeaAccess,
        landNeighbors: pItem.landNeighbors,
        centerCoordinates: pItem.centerCoordinates,
        fortLevel: 0,
        infrastructureLevel: 1,
      };
    }

    for (const item of manifestItems) {
      const isHuman = item.id === humanNationId;
      const govToApply = isHuman ? humanGovType : undefined;
      const nation = this.profileAssigner.buildNationFromManifest(
        item,
        isHuman,
        govToApply,
      );

      const relativeList = allIds.filter((id: string) => id !== item.id);
      nation.relations =
        this.relationsGenerator.generateBlankRelations(relativeList);

      nations[item.id] = nation;
    }

    const rankedNations = RankManager.recalculateRanks(nations);

    return { nations: rankedNations, provinces };
  }

  public initializeAllNations(
    detectedNationsList: string[],
    humanNationId: string,
    humanGovType?: string,
    manifest?: FinalMapManifest | null,
  ): { nations: Record<string, Nation>; provinces: Record<string, Province> } {
    if (manifest && manifest.nations && manifest.nations.length > 0) {
      return this.initializeFromManifest(manifest, humanNationId, humanGovType);
    }

    const nations: Record<string, Nation> = {};
    const provinces: Record<string, Province> = {};

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

    const rankedNations = RankManager.recalculateRanks(nations);

    return { nations: rankedNations, provinces };
  }
}
