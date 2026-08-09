import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { Province } from "@/domain/province/province.schema";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export class ProvincePixelCalculator {
  public static calculateExactPixelCounts(
    buffer: BitPackedBuffer,
  ): Map<number, number> {
    const raw = buffer.getRawBuffer();
    const counts = new Map<number, number>();
    const len = raw.length;

    for (let i = 0; i < len; i++) {
      const pid = BitPackedCellUtility.getProvinceId(raw[i]!);
      if (pid > 0) {
        counts.set(pid, (counts.get(pid) || 0) + 1);
      }
    }

    return counts;
  }

  public static syncProvincesMapPixelCounts(
    buffer: BitPackedBuffer,
    provincesMap?: Record<string, Province>,
  ): Record<string, Province> {
    if (!provincesMap || Object.keys(provincesMap).length === 0) {
      return provincesMap || {};
    }

    const counts = this.calculateExactPixelCounts(buffer);
    console.log(
      "[ProvincePixelCalculator] Buffer scan complete. Total unique province IDs found:",
      counts.size,
    );

    const countryProvincesMap = new Map<string, Province[]>();
    const countryTotalGdpMap = new Map<string, number>();
    const countryTotalPopMap = new Map<string, number>();

    for (const prov of Object.values(provincesMap)) {
      const ownerId = prov.ownerNationId;
      let list = countryProvincesMap.get(ownerId);
      if (!list) {
        list = [];
        countryProvincesMap.set(ownerId, list);
        countryTotalGdpMap.set(ownerId, 0);
        countryTotalPopMap.set(ownerId, 0);
      }
      list.push(prov);
      countryTotalGdpMap.set(
        ownerId,
        (countryTotalGdpMap.get(ownerId) || 0) + prov.gdp,
      );
      countryTotalPopMap.set(
        ownerId,
        (countryTotalPopMap.get(ownerId) || 0) + prov.population,
      );
    }

    let hasChanges = false;
    const updatedMap: Record<string, Province> = { ...provincesMap };

    for (const [ownerId, provList] of countryProvincesMap.entries()) {
      let totalCountryPixels = 0;
      for (const prov of provList) {
        const realCount = counts.get(prov.provinceId) || prov.pixelCount || 0;
        totalCountryPixels += realCount;
      }

      const totalGdp = countryTotalGdpMap.get(ownerId) || 0;
      const totalPop = countryTotalPopMap.get(ownerId) || 0;

      for (const prov of provList) {
        const pid = prov.provinceId;
        const realCount = counts.get(pid) || prov.pixelCount || 0;
        const share =
          totalCountryPixels > 0
            ? realCount / totalCountryPixels
            : 1 / provList.length;

        const calculatedGdp =
          totalGdp > 0 ? Math.floor(totalGdp * share) : prov.gdp;
        const calculatedPop =
          totalPop > 0 ? Math.floor(totalPop * share) : prov.population;

        if (
          prov.pixelCount !== realCount ||
          prov.gdp !== calculatedGdp ||
          prov.population !== calculatedPop
        ) {
          hasChanges = true;
          updatedMap[prov.provinceId.toString()] = {
            ...prov,
            pixelCount: realCount,
            gdp: calculatedGdp,
            population: calculatedPop,
          };
        }
      }
    }

    if (hasChanges) {
      console.log(
        "[ProvincePixelCalculator] Successfully recalculated pixel counts and proportional GDP/Population for provinces.",
      );
    }

    return hasChanges ? updatedMap : provincesMap;
  }
}
