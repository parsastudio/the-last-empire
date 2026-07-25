import { calculatePolygonArea } from "@/map-systems/test2/engine/geometry-utils";
import type { InputFeature } from "@/map-systems/test2/engine/types";

export interface IsolatedPolygon {
  id: string;
  countryCode: string;
  countryName: string;
  coordinates: [number, number][];
  area: number;
  center: [number, number];
}

export function extractIsolatedPolygons(
  features: InputFeature[],
): IsolatedPolygon[] {
  const list: IsolatedPolygon[] = [];

  features.forEach((feature) => {
    const rawCode =
      feature.properties?.adm0_a3 ||
      feature.properties?.ISO_A3 ||
      feature.properties?.iso_a3 ||
      feature.id ||
      "";
    const countryCode = rawCode.toString().toUpperCase();
    if (countryCode === "-99" || countryCode === "ATA") {
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
