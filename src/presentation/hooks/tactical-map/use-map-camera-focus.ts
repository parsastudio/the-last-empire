import { useCallback, RefObject } from "react";
import {
  findCountryProfileByCode,
  findCountryProfileById,
} from "@/domain/data/countries";
import { CountryMapping } from "@/domain/map/country-mapping.schema";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

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
      const buffer = BitPackedGridState.getInstance().getBuffer();

      let sumX = 0;
      let sumY = 0;
      let count = 0;

      const step = 8;
      for (let y = 0; y < mapHeight; y += step) {
        for (let x = 0; x < mapWidth; x += step) {
          if (buffer.getNationId(x, y) === targetId) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }

      if (count === 0) return;

      const centerX = sumX / count;
      const centerY = sumY / count;

      const fx = mapWidth / dimensions.width;
      const fy = mapHeight / dimensions.height;
      const currentScale = scaleRef.current || 1;

      const targetPosX = dimensions.width / 2 - (centerX / fx) * currentScale;
      const targetPosY = dimensions.height / 2 - (centerY / fy) * currentScale;

      positionRef.current = { x: targetPosX, y: targetPosY };
    },
    [countries, dimensions, mapHeight, mapWidth, scaleRef, positionRef],
  );

  return { focusOnCountry };
}
