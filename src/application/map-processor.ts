import type { Province } from "@/domain/map/province.schema";
import type { VectorProvince } from "@/map-systems/test1/engine/grid-generator";

export function processProvincesAndVectors(
  rawProvinces: Record<string, Province>,
  rawVectors: VectorProvince[],
): { provinces: Record<string, Province>; vectorProvinces: VectorProvince[] } {
  const provinces: Record<string, Province> = {};
  const vectorProvinces: VectorProvince[] = [];

  rawVectors.forEach((vec) => {
    const originalProv = rawProvinces[vec.id];
    if (originalProv) {
      provinces[vec.id] = { ...originalProv };
    }
    vectorProvinces.push({ ...vec });
  });

  return { provinces, vectorProvinces };
}
