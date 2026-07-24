import type { Province } from "@/domain/map/province.schema";
import type { VectorProvince } from "@/engine/map/grid-generator";

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
