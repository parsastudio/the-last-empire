import { useCallback, RefObject } from "react";
import {
  findCountryProfileByCode,
  findCountryProfileById,
  CountryRegistry,
} from "@/domain/data/countries";
import { CountryMapping } from "@/domain/map/country-mapping.schema";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

interface UseMapCameraFocusProps {
  mapWidth: number;
  mapHeight: number;
  dimensions: { width: number; height: number };
  scaleRef: RefObject<number>;
  countries: CountryMapping[];
  positionRef: RefObject<CameraPosition>;
}

export function useMapCameraFocus({
  mapWidth,
  mapHeight,
  dimensions,
  scaleRef,
  countries,
  positionRef,
}: UseMapCameraFocusProps) {
  const focusOnCountry = useCallback(
    (countryCodeOrId: string | number) => {
      if (dimensions.width === 0 || dimensions.height === 0) {
        return;
      }

      let matchedCountry = countries.find(
        (c) =>
          c.code.toUpperCase() === countryCodeOrId.toString().toUpperCase() ||
          c.id.toString() === countryCodeOrId.toString(),
      );

      if (!matchedCountry) {
        const profile =
          findCountryProfileByCode(countryCodeOrId.toString()) ||
          findCountryProfileById(Number(countryCodeOrId));
        if (profile) {
          matchedCountry = countries.find(
            (c) =>
              c.code.toUpperCase() === profile.code.toUpperCase() ||
              c.code.toUpperCase() === profile.flagCode.toUpperCase(),
          );
        }
      }

      if (!matchedCountry) return;

      const targetId = matchedCountry.id;
      const manifestNations = CountryRegistry.getAllManifestNations();
      const manifestNation = manifestNations.find(
        (m) =>
          m.numericId === targetId ||
          m.code.toUpperCase() === matchedCountry.code.toUpperCase() ||
          m.id === CountryRegistry.resolveCanonicalId(matchedCountry.code),
      );

      const targetProvinceIds = new Set<number>(
        manifestNation?.provinceIds || [],
      );

      const buffer = BitPackedGridState.getInstance().getBuffer();

      let sumX = 0;
      let sumY = 0;
      let count = 0;

      const step = 8;
      for (let y = 0; y < mapHeight; y += step) {
        for (let x = 0; x < mapWidth; x += step) {
          const rawPixel = buffer.getPixel(x, y);
          const provId = BitPackedCellUtility.getProvinceId(rawPixel);

          if (
            targetProvinceIds.size > 0
              ? targetProvinceIds.has(provId)
              : provId >= BitPackedCellUtility.FIRST_PROVINCE_ID
          ) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }

      if (count === 0) return;

      const centerX = sumX / count;
      const centerY = sumY / count;

      const currentScale = scaleRef.current || 1;

      const targetPosX = dimensions.width / 2 - centerX * currentScale;
      const targetPosY = dimensions.height / 2 - centerY * currentScale;

      positionRef.current = { x: targetPosX, y: targetPosY };
    },
    [countries, dimensions, mapHeight, mapWidth, scaleRef, positionRef],
  );

  return { focusOnCountry };
}
