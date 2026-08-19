import { useCallback, RefObject } from "react";
import {
  findCountryProfileByCode,
  findCountryProfileById,
  CountryRegistry,
} from "@/domain/data/countries";
import { CountryMapping } from "@/domain/map/country-mapping.schema";
import { Province } from "@/domain/province/province.schema";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

interface UseMapCameraFocusProps {
  mapWidth: number;
  mapHeight: number;
  dimensions: { width: number; height: number };
  scaleRef: RefObject<number>;
  countries: CountryMapping[];
  positionRef: RefObject<CameraPosition>;
  provincesMap?: Record<string, Province>;
}

export function useMapCameraFocus({
  mapWidth,
  mapHeight,
  dimensions,
  scaleRef,
  countries,
  positionRef,
  provincesMap,
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
      const canonicalCountryId = CountryRegistry.resolveCanonicalId(
        matchedCountry.code,
      );

      let sumX = 0;
      let sumY = 0;
      let totalWeight = 0;

      if (provincesMap) {
        for (const prov of Object.values(provincesMap)) {
          const canonicalOwner = CountryRegistry.resolveCanonicalId(
            prov.ownerNationId,
          );
          if (
            canonicalOwner === canonicalCountryId ||
            prov.countryNumericId === targetId
          ) {
            const weight = Math.max(1, prov.pixelCount);
            sumX += prov.centerCoordinates.x * weight;
            sumY += prov.centerCoordinates.y * weight;
            totalWeight += weight;
          }
        }
      }

      if (totalWeight === 0) {
        const manifestNations = CountryRegistry.getAllManifestNations();
        const manifestNation = manifestNations.find(
          (m) =>
            m.numericId === targetId ||
            m.code.toUpperCase() === canonicalCountryId,
        );

        if (!manifestNation) return;
        sumX = mapWidth / 2;
        sumY = mapHeight / 2;
        totalWeight = 1;
      }

      const centerX = sumX / totalWeight;
      const centerY = sumY / totalWeight;

      const currentScale = scaleRef.current || 1;
      const targetPosX = dimensions.width / 2 - centerX * currentScale;
      const targetPosY = dimensions.height / 2 - centerY * currentScale;

      positionRef.current = { x: targetPosX, y: targetPosY };
    },
    [
      countries,
      dimensions,
      mapHeight,
      mapWidth,
      scaleRef,
      positionRef,
      provincesMap,
    ],
  );

  return { focusOnCountry };
}
