import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

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
    const capacity = NationGettersUtility.getTerritoryIndustrialCapacity(
      nation.id,
      provincesMap,
      ownedProvinces,
    );

    const isEquipmentModernized =
      (nation.equipmentTechLevel ?? 1.0) >=
      (nation.industrialLevel ?? 1.0) - 0.05;

    let baseScore = 0;
    if (capacity.totalMaxSlots > 0) {
      if (capacity.totalEmptySlots === 0) {
        baseScore = 70;
      } else if (capacity.totalEmptySlots <= 1) {
        baseScore = 50;
      } else if (capacity.slotSaturationRatio >= 0.85) {
        baseScore = 35;
      } else {
        baseScore = Math.round(capacity.slotSaturationRatio * 30);
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
      capacity.totalEmptySlots === 0
    ) {
      baseScore += 10;
    }

    const saturationScore = Math.max(0, Math.min(100, baseScore));
    const isSaturated = saturationScore >= 55;

    return {
      totalSlots: capacity.totalMaxSlots,
      occupiedSlots: capacity.totalActiveFactories,
      emptySlots: capacity.totalEmptySlots,
      slotSaturationRatio: capacity.slotSaturationRatio,
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
