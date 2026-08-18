import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { NationProfileAssigner } from "@/infrastructure/map-preprocessing/nation-profile-assigner";
import {
  FinalMapManifest,
  FinalManifestNation,
} from "@/infrastructure/map-preprocessing/pipeline/05-export/strategic-manifest-builder";
import { RankManager } from "@/engine/politics/rank-manager";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { CountryRegistry } from "@/domain/data/countries";

export class DiplomaticMatrixGenerator {
  public generateInitialRelations(
    currentId: string,
    currentGov: string,
    allNations: { id: string; govType: string }[],
  ): Record<string, RelationProfile> {
    const relations: Record<string, RelationProfile> = {};

    for (const target of allNations) {
      if (target.id === currentId) continue;
      let baselineOpinion = 0;

      if (currentGov === target.govType) {
        baselineOpinion += 15;
      } else if (
        (currentGov === "DEMOCRACY" &&
          (target.govType === "DICTATORSHIP" ||
            target.govType === "FASCISM" ||
            target.govType === "COMMUNISM")) ||
        (target.govType === "DEMOCRACY" &&
          (currentGov === "DICTATORSHIP" ||
            currentGov === "FASCISM" ||
            currentGov === "COMMUNISM"))
      ) {
        baselineOpinion -= 15;
      } else if (currentGov !== "DEMOCRACY" && target.govType !== "DEMOCRACY") {
        baselineOpinion += 10;
      }

      relations[target.id] = {
        targetNationId: target.id,
        stance: "NORMAL_DIPLOMACY",
        opinion: baselineOpinion,
        grudge: 0,
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

    for (const pItem of manifestProvinces) {
      provinces[pItem.provinceId.toString()] = {
        provinceId: pItem.provinceId,
        nameFa: pItem.nameFa,
        countryNumericId: pItem.countryNumericId,
        ownerNationId: CountryRegistry.resolveCanonicalId(pItem.countryId),
        pixelCount: pItem.pixelCount,
        hasSeaAccess: pItem.hasSeaAccess,
        landNeighbors: pItem.landNeighbors,
        centerCoordinates: pItem.centerCoordinates,
        fortLevel: 0,
        infrastructureLevel: 1,
      };
    }

    const nationsMetaData = manifestItems.map((item) => ({
      id: CountryRegistry.resolveCanonicalId(item.code || item.id),
      govType:
        CountryRegistry.resolveCanonicalId(item.code || item.id) ===
          CountryRegistry.resolveCanonicalId(humanNationId) && humanGovType
          ? humanGovType
          : item.defaultGovernment,
    }));

    for (const item of manifestItems) {
      const cleanId = CountryRegistry.resolveCanonicalId(item.code || item.id);
      const isHuman =
        cleanId === CountryRegistry.resolveCanonicalId(humanNationId);
      const govToApply = isHuman ? humanGovType : undefined;
      const nation = this.profileAssigner.buildNationFromManifest(
        item,
        isHuman,
        govToApply,
      );

      nation.relations = this.relationsGenerator.generateInitialRelations(
        cleanId,
        nation.government.type,
        nationsMetaData,
      );

      nations[cleanId] = nation;
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

    const cleanHumanId = CountryRegistry.resolveCanonicalId(humanNationId);
    const preBuiltNations: Nation[] = [];

    for (const id of detectedNationsList) {
      const cleanId = CountryRegistry.resolveCanonicalId(id);
      const isHuman = cleanId === cleanHumanId;
      const govToApply = isHuman ? humanGovType : undefined;
      const nation = this.profileAssigner.buildStartingNation(
        cleanId,
        isHuman,
        govToApply,
      );
      preBuiltNations.push(nation);
    }

    const nationsMetaData = preBuiltNations.map((n) => ({
      id: n.id,
      govType: n.government.type,
    }));

    for (const nation of preBuiltNations) {
      nation.relations = this.relationsGenerator.generateInitialRelations(
        nation.id,
        nation.government.type,
        nationsMetaData,
      );
      nations[nation.id] = nation;
    }

    const rankedNations = RankManager.recalculateRanks(nations);

    return { nations: rankedNations, provinces };
  }
}
