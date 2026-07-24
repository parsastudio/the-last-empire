import { InputFeature } from "./world-divider";
import { FAMOUS_COUNTRIES } from "@/application/config/famous-countries";
import { MINOR_MERGE_MAP } from "@/application/config/minor-merge-map";

export function consolidateWorldMap(features: InputFeature[]): InputFeature[] {
  const consolidatedMap = new Map<string, InputFeature>();

  features.forEach((feature) => {
    const rawCode =
      feature.properties?.adm0_a3 ||
      feature.properties?.ISO_A3 ||
      feature.properties?.iso_a3 ||
      feature.id ||
      "";
    const code = rawCode.toString().toUpperCase();
    if (code === "-99" || code === "ATA") return;

    let targetCode = code;
    if (!FAMOUS_COUNTRIES.has(code)) {
      targetCode = MINOR_MERGE_MAP[code] || "REB";
    }

    let targetName =
      feature.properties?.name || feature.properties?.NAME || "Region";
    if (targetCode === "REB") {
      targetName = "Independent Territories";
    }

    if (!consolidatedMap.has(targetCode)) {
      consolidatedMap.set(targetCode, {
        type: "Feature",
        properties: {
          adm0_a3: targetCode,
          ISO_A3: targetCode,
          iso_a3: targetCode,
          name: targetCode === "REB" ? "Independent Territories" : targetName,
          NAME: targetCode === "REB" ? "Independent Territories" : targetName,
        },
        geometry: {
          type: "MultiPolygon",
          coordinates: [],
        },
      });
    }

    const targetFeature = consolidatedMap.get(targetCode)!;
    const geom = feature.geometry;
    const targetCoords = targetFeature.geometry.coordinates as number[][][][];

    if (geom.type === "Polygon") {
      targetCoords.push(geom.coordinates as number[][][]);
    } else if (geom.type === "MultiPolygon") {
      const multi = geom.coordinates as number[][][][];
      multi.forEach((poly) => {
        targetCoords.push(poly);
      });
    }
  });

  return Array.from(consolidatedMap.values());
}
