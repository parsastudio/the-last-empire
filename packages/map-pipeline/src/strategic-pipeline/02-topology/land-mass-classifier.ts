import {
  LandComponent,
  ArchipelagoGroup,
} from "@/infrastructure/core/types/map-pipeline.types";
import { ShoreDistanceUtility } from "@/infrastructure/strategic-pipeline/02-topology/utils/shore-distance.utility";

export class LandMassClassifier {
  public static readonly MINOR_MASS_THRESHOLD = 800;
  public static readonly ISOLATED_WATER_DISTANCE_THRESHOLD = 150;
  public static readonly DISTANT_OVERSEAS_DISTANCE_THRESHOLD = 500;
  public static readonly DISTANT_OVERSEAS_MIN_SIZE = 700;

  public static classify(
    allComponents: LandComponent[],
    countryNumericId: number,
    width: number,
  ): {
    majorGroups: ArchipelagoGroup[];
    minorComponents: LandComponent[];
  } {
    const majorComponents: LandComponent[] = [];
    const minorComponents: LandComponent[] = [];

    const totalCountryPixels = allComponents.reduce(
      (sum, c) => sum + c.size,
      0,
    );
    const dynamicThreshold = Math.max(
      200,
      Math.min(
        this.MINOR_MASS_THRESHOLD,
        Math.floor(totalCountryPixels * 0.15),
      ),
    );

    for (let i = 0; i < allComponents.length; i++) {
      const comp = allComponents[i]!;

      let minShoreDistance = Infinity;
      for (let j = 0; j < allComponents.length; j++) {
        if (i === j) continue;
        const other = allComponents[j]!;
        const dist = ShoreDistanceUtility.computeMinShoreDistance(
          comp,
          other,
          width,
        );
        if (dist < minShoreDistance) {
          minShoreDistance = dist;
        }
      }

      const isDistantOverseasTerritory =
        comp.size >= this.DISTANT_OVERSEAS_MIN_SIZE &&
        minShoreDistance > this.DISTANT_OVERSEAS_DISTANCE_THRESHOLD;

      if (isDistantOverseasTerritory || comp.size >= dynamicThreshold) {
        majorComponents.push(comp);
      } else {
        let isIsolated = true;
        for (let j = 0; j < allComponents.length; j++) {
          if (i === j) continue;
          const other = allComponents[j]!;
          if (other.size >= comp.size) {
            const dist = ShoreDistanceUtility.computeMinShoreDistance(
              comp,
              other,
              width,
            );
            if (dist <= this.ISOLATED_WATER_DISTANCE_THRESHOLD) {
              isIsolated = false;
              break;
            }
          }
        }

        if (isIsolated) {
          majorComponents.push(comp);
        } else {
          minorComponents.push(comp);
        }
      }
    }

    if (majorComponents.length === 0) {
      allComponents.sort((a, b) => b.size - a.size);
      const largest = allComponents[0]!;
      majorComponents.push(largest);
      minorComponents.shift();
    }

    const majorGroups: ArchipelagoGroup[] = majorComponents.map(
      (comp, idx) => ({
        id: idx + 1,
        countryNumericId,
        components: [comp],
        totalPixels: comp.size,
        centerX: comp.centerX,
        centerY: comp.centerY,
      }),
    );

    return {
      majorGroups,
      minorComponents,
    };
  }
}
