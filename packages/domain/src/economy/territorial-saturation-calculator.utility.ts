import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";

export interface TerritorialSaturationMetrics {
  totalSlots: number;
  occupiedSlots: number;
  emptySlots: number;
  slotSaturationRatio: number;
  isEquipmentModernized: boolean;
  saturationScore: number;
  isSaturated: boolean;
}

export class TerritorialSaturationCalculatorUtility {
  public static calculateSaturationMetrics(
    nation: Nation,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
  ): TerritorialSaturationMetrics {
    const provs =
      ownedProvinces ??
      NationGettersUtility.getOwnedProvinces(nation.id, provincesMap);

    let totalSlots = 0;
    let occupiedSlots = 0;

    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]!;
      const maxSlots = MapTopologyRegistry.getMaxSlots(p.provinceId, 1);
      totalSlots += maxSlots;
      occupiedSlots += p.factoriesCount || 0;
    }

    const emptySlots = Math.max(0, totalSlots - occupiedSlots);
    const slotSaturationRatio =
      totalSlots > 0 ? occupiedSlots / totalSlots : 1.0;

    const isEquipmentModernized =
      (nation.equipmentTechLevel ?? 1.0) >=
      (nation.industrialLevel ?? 1.0) - 0.05;

    let baseScore = 0;
    if (totalSlots > 0) {
      if (emptySlots === 0) {
        baseScore = 70;
      } else if (emptySlots <= 1) {
        baseScore = 50;
      } else if (slotSaturationRatio >= 0.85) {
        baseScore = 35;
      } else {
        baseScore = Math.round(slotSaturationRatio * 30);
      }
    }

    if (isEquipmentModernized) {
      baseScore += 15;
    }

    if (nation.treasury >= 30_000_000_000) {
      baseScore += 10;
    } else if (nation.treasury >= 15_000_000_000) {
      baseScore += 5;
    }

    if (nation.doctrine === "MILITARIST_HAWK") {
      baseScore += 15;
    } else if (nation.doctrine === "GLOBAL_HEGEMON") {
      baseScore += 10;
    } else if (
      nation.doctrine === "DOMESTIC_INDUSTRIALIST" &&
      emptySlots === 0
    ) {
      baseScore += 10;
    }

    const saturationScore = Math.max(0, Math.min(100, baseScore));
    const isSaturated = saturationScore >= 55;

    return {
      totalSlots,
      occupiedSlots,
      emptySlots,
      slotSaturationRatio,
      isEquipmentModernized,
      saturationScore,
      isSaturated,
    };
  }

  public static calculateSaturationScore(
    nation: Nation,
    provincesMap?:
      | Record<string, ProvinceDynamicState>
      | ProvinceDynamicState[],
    ownedProvinces?: ProvinceDynamicState[],
  ): number {
    return this.calculateSaturationMetrics(nation, provincesMap, ownedProvinces)
      .saturationScore;
  }

  public static calculateExpansionAppetite(
    sourceSaturationScore: number,
    powerRatio: number,
    isNeighbor: boolean,
  ): number {
    if (!isNeighbor || sourceSaturationScore < 40) {
      return 0;
    }

    if (powerRatio > 0.85) {
      return 0;
    }

    const powerAdvantage = Math.max(0, 1.0 - powerRatio);
    const saturationWeight = (sourceSaturationScore - 30) / 70;
    return Math.round(saturationWeight * powerAdvantage * 35);
  }
}
