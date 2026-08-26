import { useCallback, RefObject } from "react";
import { ALL_COUNTRY_PROFILES, CountryRegistry } from "@/domain/data/countries";
import { Province } from "@/domain/province/province.schema";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

interface UseMapCameraFocusProps {
  mapWidth: number;
  mapHeight: number;
  dimensions: { width: number; height: number };
  scaleRef: RefObject<number>;
  positionRef: RefObject<CameraPosition>;
  provincesMap?: Record<string, Province>;
}

export function useMapCameraFocus({
  mapWidth,
  mapHeight,
  dimensions,
  scaleRef,
  positionRef,
  provincesMap,
}: UseMapCameraFocusProps) {
  const focusOnCountry = useCallback(
    (countryIso3OrFlag: string) => {
      if (dimensions.width === 0 || dimensions.height === 0) {
        return;
      }

      const canonicalIso3 =
        CountryRegistry.resolveCanonicalId(countryIso3OrFlag);

      let sumX = 0;
      let sumY = 0;
      let totalWeight = 0;

      if (provincesMap) {
        for (const prov of Object.values(provincesMap)) {
          const canonicalOwner = CountryRegistry.resolveCanonicalId(
            prov.ownerNationId,
          );
          if (canonicalOwner === canonicalIso3) {
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
            CountryRegistry.resolveCanonicalId(m.code || m.id) ===
            canonicalIso3,
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
    [dimensions, mapHeight, mapWidth, scaleRef, positionRef, provincesMap],
  );

  return { focusOnCountry };
}
