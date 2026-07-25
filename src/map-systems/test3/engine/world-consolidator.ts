import { InputFeature } from "../../test2/engine/types";
import { calculatePolygonArea } from "../../test2/engine/geometry-utils";
import { PolygonDissolver } from "../../test1/engine/polygon-dissolver";
import { DELETED_COUNTRIES } from "./deleted-countries";
import { MINOR_MERGE_MAP } from "./minor-merge-map";

export function consolidateWorldMap(features: InputFeature[]): InputFeature[] {
  const countryPolygons = new Map<string, [number, number][][]>();
  const countryNames = new Map<string, string>();

  features.forEach((f) => {
    const rawCode =
      f.properties?.adm0_a3 ||
      f.properties?.ISO_A3 ||
      f.properties?.iso_a3 ||
      f.id ||
      "";
    const code = rawCode.toString().toUpperCase();
    if (code === "-99" || code === "ATA") return;

    const name = f.properties?.name || f.properties?.NAME || code;

    const rawPolygons: [number, number][][] = [];
    const geom = f.geometry;
    if (geom.type === "Polygon") {
      const coords = geom.coordinates as number[][][];
      coords.forEach((ring) => {
        rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
      });
    } else if (geom.type === "MultiPolygon") {
      const multi = geom.coordinates as number[][][][];
      multi.forEach((poly) => {
        poly.forEach((ring) => {
          rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
        });
      });
    }

    const minAreaLimit = code === "CAN" || code === "RUS" ? 12.0 : 0.005;
    const filteredPolygons: [number, number][][] = [];

    rawPolygons.forEach((poly) => {
      const area = calculatePolygonArea(poly);
      if (area >= minAreaLimit) {
        filteredPolygons.push(poly);
      }
    });

    if (filteredPolygons.length === 0) return;

    let targetCode = code;
    if (DELETED_COUNTRIES.has(code)) {
      const mappedTarget = MINOR_MERGE_MAP[code];
      if (mappedTarget) {
        targetCode = mappedTarget;
      } else {
        return;
      }
    }

    if (!countryPolygons.has(targetCode)) {
      countryPolygons.set(targetCode, []);
      countryNames.set(targetCode, name);
    }

    countryPolygons.get(targetCode)!.push(...filteredPolygons);
  });

  const dissolver = new PolygonDissolver();
  const resultFeatures: InputFeature[] = [];

  countryPolygons.forEach((polys, code) => {
    if (polys.length === 0) return;
    const name = countryNames.get(code) || code;
    const dissolved = dissolver.dissolve(polys);

    resultFeatures.push({
      type: "Feature",
      properties: {
        adm0_a3: code,
        ISO_A3: code,
        iso_a3: code,
        name,
        NAME: name,
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: dissolved.map((poly) => [poly]),
      },
    });
  });

  return resultFeatures;
}
