import fs from "fs/promises";
import path from "path";
import { ALL_COUNTRY_PROFILES, CountryProfile } from "@/domain/data/countries";
import { ProvinceClusterInfo } from "@/infrastructure/map-preprocessing/final/province-partition-engine";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export interface FinalManifestProvince {
  provinceId: number;
  nameFa: string;
  countryId: string;
  countryNumericId: number;
  pixelCount: number;
  hasSeaAccess: boolean;
  landNeighbors: number[];
  centerCoordinates: { x: number; y: number };
  baseGdpShare: number;
  basePopulationShare: number;
}

export interface FinalManifestNation {
  id: string;
  numericId: number;
  code: string;
  flagCode: string;
  nameFa: string;
  nameEn: string;
  gdp: number;
  population: number;
  territoryPixelCount: number;
  provinceIds: number[];
  startingTreasury: number;
  initialRank: number;
  defaultGovernment: string;
}

export interface FinalMapManifest {
  mapId: string;
  totalProvincesCount: number;
  totalNationsCount: number;
  width: number;
  height: number;
  provinces: FinalManifestProvince[];
  nations: FinalManifestNation[];
}

export class FinalManifestBuilder {
  public async buildAndSave(
    mapId: string,
    provinceMap: Map<number, ProvinceClusterInfo>,
    width: number,
    height: number,
  ): Promise<FinalMapManifest> {
    const countryProvincesMap = new Map<number, ProvinceClusterInfo[]>();

    for (const info of provinceMap.values()) {
      let list = countryProvincesMap.get(info.countryNumericId);
      if (!list) {
        list = [];
        countryProvincesMap.set(info.countryNumericId, list);
      }
      list.push(info);
    }

    const manifestProvinces: FinalManifestProvince[] = [];
    const manifestNations: FinalManifestNation[] = [];

    const activeProfiles = ALL_COUNTRY_PROFILES.filter((p: CountryProfile) =>
      countryProvincesMap.has(p.id ?? 0),
    );

    activeProfiles.sort((a, b) => b.gdp - a.gdp);

    for (let rankIndex = 0; rankIndex < activeProfiles.length; rankIndex++) {
      const profile = activeProfiles[rankIndex]!;
      const countryNumericId = profile.id ?? 0;
      const countryId = `NATION_${profile.code.toUpperCase()}`;
      const provList = countryProvincesMap.get(countryNumericId) || [];

      const totalCountryPixels = provList.reduce(
        (sum, p) => sum + p.pixelCount,
        0,
      );
      const provIds: number[] = [];

      for (let pIndex = 0; pIndex < provList.length; pIndex++) {
        const pInfo = provList[pIndex]!;
        provIds.push(pInfo.provinceId);

        const share =
          totalCountryPixels > 0
            ? pInfo.pixelCount / totalCountryPixels
            : 1 / provList.length;

        manifestProvinces.push({
          provinceId: pInfo.provinceId,
          nameFa: `استان ${profile.nameFa} (${pIndex + 1})`,
          countryId,
          countryNumericId,
          pixelCount: pInfo.pixelCount,
          hasSeaAccess: pInfo.hasSeaAccess,
          landNeighbors: Array.from(pInfo.landNeighbors),
          centerCoordinates: pInfo.centerCoordinates,
          baseGdpShare: Number(share.toFixed(6)),
          basePopulationShare: Number(share.toFixed(6)),
        });
      }

      manifestNations.push({
        id: countryId,
        numericId: countryNumericId,
        code: profile.code,
        flagCode: profile.flagCode,
        nameFa: profile.nameFa,
        nameEn: profile.nameEn,
        gdp: profile.gdp,
        population: profile.population,
        territoryPixelCount: totalCountryPixels,
        provinceIds: provIds,
        startingTreasury: Math.floor(profile.gdp * 0.05),
        initialRank: rankIndex + 1,
        defaultGovernment: profile.startingGovernment ?? "DEMOCRACY",
      });
    }

    this.logDetailedStatistics(manifestProvinces, manifestNations);

    const manifest: FinalMapManifest = {
      mapId,
      totalProvincesCount: manifestProvinces.length,
      totalNationsCount: manifestNations.length,
      width,
      height,
      provinces: manifestProvinces,
      nations: manifestNations,
    };

    const targetDir = MapPathResolver.getMapFinalServerDir(mapId);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(
      path.join(targetDir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf-8",
    );

    return manifest;
  }

  private logDetailedStatistics(
    provinces: FinalManifestProvince[],
    nations: FinalManifestNation[],
  ): void {
    if (provinces.length === 0) return;

    let minPixels = Infinity;
    let maxPixels = -1;
    let minProvInfo = "";
    let maxProvInfo = "";
    let totalPixelsSum = 0;

    let under500Count = 0;
    let range500To1500Count = 0;
    let range1500To3000Count = 0;
    let above3000Count = 0;

    for (let i = 0; i < provinces.length; i++) {
      const p = provinces[i]!;
      const px = p.pixelCount;
      totalPixelsSum += px;

      if (px < minPixels) {
        minPixels = px;
        minProvInfo = `${p.nameFa} (${p.countryId}) - ${px} px`;
      }
      if (px > maxPixels) {
        maxPixels = px;
        maxProvInfo = `${p.nameFa} (${p.countryId}) - ${px} px`;
      }

      if (px < 500) under500Count++;
      else if (px < 1500) range500To1500Count++;
      else if (px < 3000) range1500To3000Count++;
      else above3000Count++;
    }

    const avgPixels = Math.round(totalPixelsSum / provinces.length);

    let singleProvinceNationsCount = 0;
    let multiProvinceNationsCount = 0;

    for (let i = 0; i < nations.length; i++) {
      const n = nations[i]!;
      if (n.provinceIds.length === 1) {
        singleProvinceNationsCount++;
      } else {
        multiProvinceNationsCount++;
      }
    }
  }
}
