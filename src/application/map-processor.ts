import { FAMOUS_COUNTRIES, MINOR_MERGE_MAP } from "./map-simplification.config";
import type { Province } from "@/domain/map/province.schema";
import type { VectorProvince } from "@/engine/map/grid-generator";

export function processProvincesAndVectors(
  rawProvinces: Record<string, Province>,
  rawVectors: VectorProvince[],
): { provinces: Record<string, Province>; vectorProvinces: VectorProvince[] } {
  const provinces: Record<string, Province> = {};
  const vectorProvinces: VectorProvince[] = [];

  rawVectors.forEach((vec) => {
    const countryCode = vec.countryCode;
    const isFamous = FAMOUS_COUNTRIES.has(countryCode);
    const mergeParent = MINOR_MERGE_MAP[countryCode];

    if (isFamous) {
      const originalProv = rawProvinces[vec.id];
      if (originalProv) {
        provinces[vec.id] = { ...originalProv };
      }
      vectorProvinces.push({ ...vec });
    } else if (mergeParent) {
      const originalProv = rawProvinces[vec.id];
      if (originalProv) {
        provinces[vec.id] = {
          ...originalProv,
          ownerNationId: mergeParent,
        };
      }
      vectorProvinces.push({
        ...vec,
        countryCode: mergeParent,
      });
    }
  });

  return { provinces, vectorProvinces };
}
