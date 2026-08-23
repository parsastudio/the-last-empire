import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import {
  MajorLandMass,
  LandComponent,
} from "@/infrastructure/map-preprocessing/core/map-preprocessing.types";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class ProvinceCountAllocator {
  public static readonly SMALL_TERRITORY_PIXEL_THRESHOLD = 3000;
  public static readonly GDP_TIER_1_THRESHOLD = 100_000_000_000;
  public static readonly GDP_TIER_2_THRESHOLD = 500_000_000_000;
  public static readonly GDP_TIER_3_THRESHOLD = 1_000_000_000_000;
  public static readonly DISTANT_OVERSEAS_DISTANCE = 500;
  public static readonly DISTANT_OVERSEAS_SIZE = 700;

  private static computeMinShoreDistance(
    compA: LandComponent,
    compB: LandComponent,
    width: number,
  ): number {
    let minD = Infinity;
    const stepA = Math.max(1, Math.floor(compA.pixelIndices.length / 40));
    const stepB = Math.max(1, Math.floor(compB.pixelIndices.length / 40));

    for (let i = 0; i < compA.pixelIndices.length; i += stepA) {
      const idxA = compA.pixelIndices[i]!;
      const ax = idxA % width;
      const ay = Math.floor(idxA / width);

      for (let j = 0; j < compB.pixelIndices.length; j += stepB) {
        const idxB = compB.pixelIndices[j]!;
        const bx = idxB % width;
        const by = Math.floor(idxB / width);

        const rawDx = Math.abs(ax - bx);
        const dx = Math.min(rawDx, width - rawDx);
        const dy = ay - by;
        const dist = Math.hypot(dx, dy);

        if (dist < minD) {
          minD = dist;
          if (minD <= 2) return minD;
        }
      }
    }
    return minD;
  }

  public static calculateTotalProvinces(
    countryNumericId: number,
    totalPixels: number,
  ): number {
    const profile = ALL_COUNTRY_PROFILES.find((p) => p.id === countryNumericId);
    const rawGdp = profile?.gdp ?? 0;
    const gdp =
      rawGdp > 0 && rawGdp < 100_000 ? rawGdp * 1_000_000_000 : rawGdp;

    let targetCount = 1;

    if (gdp < this.GDP_TIER_1_THRESHOLD) {
      targetCount = 1;
    } else if (gdp <= this.GDP_TIER_2_THRESHOLD) {
      targetCount = 2;
    } else if (gdp < this.GDP_TIER_3_THRESHOLD) {
      targetCount = 3;
    } else {
      targetCount = 4;
    }

    if (totalPixels < this.SMALL_TERRITORY_PIXEL_THRESHOLD && targetCount > 2) {
      targetCount = 2;
    }

    return Math.max(1, Math.min(4, targetCount));
  }

  public static allocateProvincesToMasses(
    majorMasses: MajorLandMass[],
    totalPixels: number,
    countryNumericId: number,
    width: number = MAP_CONFIG.HIGH_RES_WIDTH,
  ): Map<number, number> {
    const allocations = new Map<number, number>();
    if (majorMasses.length === 0) {
      return allocations;
    }

    const totalK = this.calculateTotalProvinces(countryNumericId, totalPixels);

    if (majorMasses.length === 1 || totalK <= 1) {
      allocations.set(majorMasses[0]!.id, totalK);
      for (let i = 1; i < majorMasses.length; i++) {
        allocations.set(majorMasses[i]!.id, 0);
      }
      return allocations;
    }

    const idealProvinceSize = totalPixels / totalK;
    const minEligibleSize = Math.max(2500, Math.floor(idealProvinceSize * 0.4));

    const sortedMasses = [...majorMasses].sort(
      (a, b) => b.totalPixels - a.totalPixels,
    );
    const largestMass = sortedMasses[0]!;

    const distantOverseasMassIds = new Set<number>();

    for (let i = 0; i < sortedMasses.length; i++) {
      const mass = sortedMasses[i]!;
      if (mass.id === largestMass.id) continue;

      const comp = mass.components[0];
      if (!comp) continue;

      let minShoreDistance = Infinity;
      for (let j = 0; j < sortedMasses.length; j++) {
        if (i === j) continue;
        const otherComp = sortedMasses[j]!.components[0];
        if (!otherComp) continue;

        const dist = this.computeMinShoreDistance(comp, otherComp, width);
        if (dist < minShoreDistance) {
          minShoreDistance = dist;
        }
      }

      if (
        mass.totalPixels >= this.DISTANT_OVERSEAS_SIZE &&
        minShoreDistance > this.DISTANT_OVERSEAS_DISTANCE
      ) {
        distantOverseasMassIds.add(mass.id);
      }
    }

    const qualifyingMasses: MajorLandMass[] = [];
    for (let i = 0; i < sortedMasses.length; i++) {
      const mass = sortedMasses[i]!;
      const isDistantOverseas = distantOverseasMassIds.has(mass.id);

      if (
        mass.id === largestMass.id ||
        isDistantOverseas ||
        (mass.totalPixels >= minEligibleSize &&
          mass.totalPixels >= totalPixels * 0.12)
      ) {
        qualifyingMasses.push(mass);
      } else {
        allocations.set(mass.id, 0);
      }
    }

    if (qualifyingMasses.length === 1) {
      allocations.set(largestMass.id, totalK);
      for (let i = 0; i < majorMasses.length; i++) {
        if (!allocations.has(majorMasses[i]!.id)) {
          allocations.set(majorMasses[i]!.id, 0);
        }
      }
      return allocations;
    }

    const baseShares = new Map<number, number>();
    let assignedSoFar = 0;

    for (const massId of distantOverseasMassIds) {
      baseShares.set(massId, 1);
      assignedSoFar += 1;
    }

    const remainingProvincesForMainland = Math.max(1, totalK - assignedSoFar);
    const nonDistantQualifying = qualifyingMasses.filter(
      (m) => !distantOverseasMassIds.has(m.id),
    );
    const nonDistantTotalPixels = nonDistantQualifying.reduce(
      (sum, m) => sum + m.totalPixels,
      0,
    );

    const fractionalQuotas = new Map<number, number>();

    for (let i = 0; i < nonDistantQualifying.length; i++) {
      const mass = nonDistantQualifying[i]!;
      const exactQuota =
        (mass.totalPixels / (nonDistantTotalPixels || 1)) *
        remainingProvincesForMainland;
      fractionalQuotas.set(mass.id, exactQuota);
      const floorShare = Math.max(1, Math.floor(exactQuota));
      baseShares.set(mass.id, floorShare);
      assignedSoFar += floorShare;
    }

    while (assignedSoFar > totalK) {
      let minFloorMassId = -1;
      let minFloor = Infinity;

      for (let i = nonDistantQualifying.length - 1; i >= 0; i--) {
        const mass = nonDistantQualifying[i]!;
        if (mass.id === largestMass.id) continue;
        const share = baseShares.get(mass.id) || 0;
        if (share > 0 && share < minFloor) {
          minFloor = share;
          minFloorMassId = mass.id;
        }
      }

      if (minFloorMassId !== -1) {
        baseShares.set(minFloorMassId, 0);
        assignedSoFar -= minFloor;
      } else {
        const largestShare = baseShares.get(largestMass.id) || 1;
        baseShares.set(largestMass.id, Math.max(1, largestShare - 1));
        assignedSoFar--;
      }
    }

    let remainingToAssign = totalK - assignedSoFar;

    const remainders = nonDistantQualifying
      .filter((m) => (baseShares.get(m.id) || 0) > 0 || m.id === largestMass.id)
      .map((m) => ({
        id: m.id,
        rem:
          (fractionalQuotas.get(m.id) || 0) -
          Math.floor(fractionalQuotas.get(m.id) || 0),
        size: m.totalPixels,
      }))
      .sort((a, b) => {
        if (Math.abs(b.rem - a.rem) > 0.05) return b.rem - a.rem;
        return b.size - a.size;
      });

    let remIndex = 0;
    while (remainingToAssign > 0 && remainders.length > 0) {
      const target = remainders[remIndex % remainders.length]!;
      baseShares.set(target.id, (baseShares.get(target.id) || 0) + 1);
      remainingToAssign--;
      remIndex++;
    }

    for (let i = 0; i < majorMasses.length; i++) {
      const mass = majorMasses[i]!;
      allocations.set(mass.id, baseShares.get(mass.id) || 0);
    }

    return allocations;
  }
}
