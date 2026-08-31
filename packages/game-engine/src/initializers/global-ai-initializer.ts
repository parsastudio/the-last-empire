import {
  Nation,
  Province,
  RelationProfile,
  CountryRegistry,
  FinalMapManifest,
  FinalManifestNation,
  IndustryCalculator,
} from "@geopolitics/domain";
import { NationProfileAssigner } from "@/engine/initializers/nation-profile-assigner";

export class DiplomaticMatrixGenerator {
  public generateInitialRelations(
    currentId: string,
    allNations: { id: string; govType: string }[],
  ): Record<string, RelationProfile> {
    const relations: Record<string, RelationProfile> = {};

    for (const target of allNations) {
      if (target.id === currentId) continue;
      relations[target.id] = {
        targetNationId: target.id,
        stance: "NORMAL_DIPLOMACY",
        alignment: 0,
        tension: 10,
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

    const provsByCountry = new Map<string, typeof manifestProvinces>();
    for (const p of manifestProvinces) {
      const cId = CountryRegistry.resolveCanonicalId(p.countryId);
      const list = provsByCountry.get(cId) || [];
      list.push(p);
      provsByCountry.set(cId, list);
    }

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

      const countryProvs = provsByCountry.get(cleanId) || [];
      let allocatedFactoriesSum = 0;

      for (let i = 0; i < countryProvs.length; i++) {
        const pItem = countryProvs[i]!;
        const active = pItem.factoriesCount ?? 1;
        const slots = Math.max(active, pItem.maxSlots ?? active);
        allocatedFactoriesSum += active;

        provinces[pItem.provinceId.toString()] = {
          provinceId: pItem.provinceId,
          nameFa: pItem.nameFa,
          ownerNationId: cleanId,
          originalNationId: pItem.originalCountryId
            ? CountryRegistry.resolveCanonicalId(pItem.originalCountryId)
            : cleanId,
          pixelCount: pItem.pixelCount,
          hasSeaAccess: pItem.hasSeaAccess,
          landNeighbors: pItem.landNeighbors,
          maritimeNeighborsTier1: pItem.maritimeNeighborsTier1 || [],
          maritimeNeighborsTier2: pItem.maritimeNeighborsTier2 || [],
          centerCoordinates: pItem.centerCoordinates,
          population: pItem.population ?? 1000000,
          maxSlots: slots,
          factoriesCount: active,
        };
      }

      nation.factoryTiers = [
        {
          techLevel: nation.equipmentTechLevel,
          count:
            allocatedFactoriesSum > 0
              ? allocatedFactoriesSum
              : IndustryCalculator.calculateStartingTotalFactories(
                  item.gdp,
                  nation.equipmentTechLevel,
                ),
        },
      ];

      nations[cleanId] = nation;
    }

    const nationsMetaData = manifestItems.map((item) => ({
      id: CountryRegistry.resolveCanonicalId(item.code || item.id),
      govType:
        CountryRegistry.resolveCanonicalId(item.code || item.id) ===
          CountryRegistry.resolveCanonicalId(humanNationId) && humanGovType
          ? humanGovType
          : item.defaultGovernment,
    }));

    for (const nation of Object.values(nations)) {
      nation.relations = this.relationsGenerator.generateInitialRelations(
        nation.id,
        nationsMetaData,
      );
    }

    return { nations, provinces };
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
        nationsMetaData,
      );
      nations[nation.id] = nation;
    }

    return { nations, provinces };
  }
}
