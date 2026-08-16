import {
  LandComponent,
  ArchipelagoGroup,
} from "@/infrastructure/map-preprocessing/core/map-preprocessing.types";

export class LandMassClassifier {
  public static readonly MINOR_MASS_THRESHOLD = 3500;
  public static readonly ISOLATED_WATER_DISTANCE_THRESHOLD = 120;

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

    for (let i = 0; i < allComponents.length; i++) {
      const comp = allComponents[i]!;
      if (comp.size >= this.MINOR_MASS_THRESHOLD) {
        majorComponents.push(comp);
      } else {
        let isIsolated = true;
        for (let j = 0; j < allComponents.length; j++) {
          if (i === j) continue;
          const other = allComponents[j]!;
          if (other.size >= comp.size) {
            const directDx = Math.abs(comp.centerX - other.centerX);
            const dx = Math.min(directDx, width - directDx);
            const dy = comp.centerY - other.centerY;
            const dist = Math.hypot(dx, dy);
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
