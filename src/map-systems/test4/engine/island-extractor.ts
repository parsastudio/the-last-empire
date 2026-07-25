import { calculatePolygonArea } from "./geometry-utils";
import type { InputFeature } from "@/map-systems/test2/engine/types";
import type { IsolatedPolygon } from "./types";

export function getCountryCode(
  properties: Record<string, unknown> | undefined,
  id?: string | number,
): string {
  if (!properties) {
    return id ? id.toString().toUpperCase() : "";
  }
  const keys = [
    "ADM0_A3",
    "adm0_a3",
    "ISO_A3_EH",
    "iso_a3_eh",
    "ISO_A3",
    "iso_a3",
  ];
  for (const key of keys) {
    const val = properties[key];
    if (typeof val === "string" && val !== "" && val !== "-99") {
      return val.toUpperCase();
    }
  }
  return id ? id.toString().toUpperCase() : "";
}

export function extractIsolatedPolygons(
  features: InputFeature[],
): IsolatedPolygon[] {
  const list: IsolatedPolygon[] = [];

  features.forEach((feature) => {
    const props = feature.properties as Record<string, unknown> | undefined;
    const countryCode = getCountryCode(props, feature.id);

    if (countryCode === "" || countryCode === "ATA") {
      return;
    }
    const countryName =
      feature.properties?.name || feature.properties?.NAME || countryCode;

    const rawPolygons: [number, number][][] = [];
    const geom = feature.geometry;

    if (geom.type === "Polygon") {
      const coords = geom.coordinates as number[][][];
      coords.forEach((ring) => {
        rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
      });
    } else if (geom.type === "MultiPolygon") {
      const multiCoords = geom.coordinates as number[][][][];
      multiCoords.forEach((poly) => {
        poly.forEach((ring) => {
          rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
        });
      });
    }

    rawPolygons.forEach((poly, index) => {
      const area = calculatePolygonArea(poly);
      if (area < 0.0001) {
        return;
      }

      let sumX = 0;
      let sumY = 0;
      poly.forEach((pt) => {
        sumX += pt[0];
        sumY += pt[1];
      });
      const center: [number, number] =
        poly.length > 0 ? [sumX / poly.length, sumY / poly.length] : [0, 0];

      list.push({
        id: `${countryCode}_ISLAND_${index + 1}`,
        countryCode,
        countryName,
        coordinates: poly,
        area,
        center,
      });
    });
  });

  return list;
}
