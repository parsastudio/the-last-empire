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
    console.log(
      `[DIAGNOSTIC-MANIFEST] Starting Manifest Build. Input provinceMap size: ${provinceMap.size}`,
    );

    const countryProvincesMap = new Map<number, ProvinceClusterInfo[]>();

    for (const info of provinceMap.values()) {
      let list = countryProvincesMap.get(info.countryNumericId);
      if (!list) {
        list = [];
        countryProvincesMap.set(info.countryNumericId, list);
      }
      list.push(info);
    }

    console.log(
      `[DIAGNOSTIC-MANIFEST] Unique Country Numeric IDs in provinceMap: ${countryProvincesMap.size}`,
    );

    const allMapProvinceIds = new Set<number>(provinceMap.keys());
    const manifestProvinces: FinalManifestProvince[] = [];
    const manifestNations: FinalManifestNation[] = [];
    const includedProvinceIds = new Set<number>();

    const activeProfiles = ALL_COUNTRY_PROFILES.filter((p: CountryProfile) =>
      countryProvincesMap.has(p.id ?? 0),
    );

    console.log(
      `[DIAGNOSTIC-MANIFEST] ALL_COUNTRY_PROFILES count: ${ALL_COUNTRY_PROFILES.length}`,
    );
    console.log(
      `[DIAGNOSTIC-MANIFEST] Matched activeProfiles count: ${activeProfiles.length}`,
    );

    for (const countryNumericId of countryProvincesMap.keys()) {
      const profile = ALL_COUNTRY_PROFILES.find(
        (p) => p.id === countryNumericId,
      );
      if (!profile) {
        console.error(
          `[DIAGNOSTIC-MANIFEST CRITICAL ERROR] Country Numeric ID ${countryNumericId} exists in provinceMap but HAS NO MATCHING PROFILE in ALL_COUNTRY_PROFILES!`,
        );
      }
    }

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
        includedProvinceIds.add(pInfo.provinceId);

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

    const missingProvinceIds: number[] = [];
    for (const pid of allMapProvinceIds) {
      if (!includedProvinceIds.has(pid)) {
        missingProvinceIds.push(pid);
      }
    }

    if (missingProvinceIds.length > 0) {
      console.error(
        `[DIAGNOSTIC-MANIFEST CRITICAL ERROR] ${missingProvinceIds.length} Province IDs were GENERATED in Map BUT DROPPED from Manifest!`,
      );
      console.error(
        `[DIAGNOSTIC-MANIFEST CRITICAL ERROR] Dropped Province IDs sample:`,
        missingProvinceIds.slice(0, 20),
      );
    } else {
      console.log(
        `[DIAGNOSTIC-MANIFEST SUCCESS] All ${includedProvinceIds.size} generated province IDs successfully written to Manifest.`,
      );
    }

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

    console.log(`[DIAGNOSTIC-MANIFEST] Saved manifest.json to ${targetDir}`);

    return manifest;
  }
}
