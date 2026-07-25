import { getCountryCode } from "./island-extractor";
import { calculatePolygonArea } from "@/map-systems/test2/engine/geometry-utils";
import { smoothPolygonChaikin } from "./polygon-smoother";
import type { GeoJsonData } from "@/map-systems/test2/engine/types";
import type { CountryPhase1 } from "./types";

export function parseGeoJsonCountries(geoJson: GeoJsonData): CountryPhase1[] {
  const features = geoJson.features;

  return features
    .filter((f) => {
      const props = f.properties as Record<string, unknown> | undefined;
      const code = getCountryCode(props, f.id);
      return code && code !== "ATA";
    })
    .map((f) => {
      const props = f.properties as Record<string, unknown> | undefined;
      const code = getCountryCode(props, f.id);
      const name = f.properties?.name || f.properties?.NAME || code;

      const rings: [number, number][][] = [];
      const geom = f.geometry;
      if (geom.type === "Polygon") {
        const coords = geom.coordinates as number[][][];
        coords.forEach((ring) => {
          rings.push(ring.map((pt) => [pt[0], pt[1]]));
        });
      } else if (geom.type === "MultiPolygon") {
        const multi = geom.coordinates as number[][][][];
        multi.forEach((poly) => {
          poly.forEach((ring) => {
            rings.push(ring.map((pt) => [pt[0], pt[1]]));
          });
        });
      }

      let countryArea = 0;
      rings.forEach((ring) => {
        countryArea += calculatePolygonArea(ring);
      });

      const smoothedRings = rings.map((ring) => smoothPolygonChaikin(ring, 3));

      return {
        code,
        name,
        rings: smoothedRings,
        area: countryArea,
      };
    });
}
