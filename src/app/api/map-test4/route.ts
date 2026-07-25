import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  extractIsolatedPolygons,
  getCountryCode,
} from "@/map-systems/test4/engine/island-extractor";
import { subdivideSinglePolygon } from "@/map-systems/test4/engine/polygon-subdivider";
import { smoothPolygonChaikin } from "@/map-systems/test4/engine/polygon-smoother";
import { buildSpatialNeighbors } from "@/map-systems/test4/engine/spatial-index";
import { calculatePolygonArea } from "@/map-systems/test2/engine/geometry-utils";
import type { GeoJsonData } from "@/map-systems/test2/engine/types";
import type { RegionPhase3 } from "@/map-systems/test4/engine/types";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "ne_110m_admin_0_countries.geojson",
    );

    let fileContent: string;
    try {
      fileContent = await fs.readFile(filePath, "utf-8");
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Local file ne_110m_admin_0_countries.geojson not found in public folder.",
        },
        { status: 404 },
      );
    }

    const geoJson = JSON.parse(fileContent) as GeoJsonData;
    const features = geoJson.features;

    const phase1Countries = features
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

        return {
          code,
          name,
          rings,
          area: countryArea,
        };
      });

    const phase2Islands = extractIsolatedPolygons(features);

    const totalWeightTarget = 3000;
    const totalAreaSqrt = phase1Countries.reduce(
      (sum, c) => sum + Math.sqrt(c.area),
      0,
    );

    const countryRegionsAllocations = new Map<string, number>();
    phase1Countries.forEach((c) => {
      const share = Math.sqrt(c.area) / totalAreaSqrt;
      const allocated = Math.max(1, Math.round(totalWeightTarget * share));
      countryRegionsAllocations.set(c.code, allocated);
    });

    const phase3Regions: RegionPhase3[] = [];

    const countryPolygonsGroup = new Map<
      string,
      { name: string; polys: [number, number][][] }
    >();
    phase2Islands.forEach((island) => {
      if (!countryPolygonsGroup.has(island.countryCode)) {
        countryPolygonsGroup.set(island.countryCode, {
          name: island.countryName,
          polys: [],
        });
      }
      countryPolygonsGroup
        .get(island.countryCode)!
        .polys.push(island.coordinates);
    });

    countryPolygonsGroup.forEach((data, cCode) => {
      const totalCountryAllocated = countryRegionsAllocations.get(cCode) || 1;
      const polys = data.polys;
      const name = data.name;

      const polyAreas = polys.map((p) => calculatePolygonArea(p));
      const totalPolyArea = polyAreas.reduce((sum, a) => sum + a, 0);

      let allocatedRemaining = totalCountryAllocated;
      const allocations = polys.map((_, idx) => {
        const area = polyAreas[idx] || 0;
        const share =
          totalPolyArea > 0 ? area / totalPolyArea : 1 / polys.length;
        const count = Math.max(1, Math.round(totalCountryAllocated * share));
        allocatedRemaining -= count;
        return count;
      });

      if (allocatedRemaining !== 0) {
        let maxIdx = 0;
        let maxVal = -1;
        polyAreas.forEach((a, idx) => {
          if (a > maxVal) {
            maxVal = a;
            maxIdx = idx;
          }
        });
        const current = allocations[maxIdx] || 1;
        allocations[maxIdx] = Math.max(1, current + allocatedRemaining);
      }

      polys.forEach((poly, polyIdx) => {
        const rCount = allocations[polyIdx] || 1;
        const subdivided = subdivideSinglePolygon(poly, rCount);

        subdivided.forEach((subPoly, subIdx) => {
          const area = calculatePolygonArea(subPoly);

          let sumX = 0;
          let sumY = 0;
          subPoly.forEach((pt) => {
            sumX += pt[0];
            sumY += pt[1];
          });
          const center: [number, number] =
            subPoly.length > 0
              ? [sumX / subPoly.length, sumY / subPoly.length]
              : [0, 0];

          phase3Regions.push({
            id: `${cCode}_REG_${polyIdx + 1}_${subIdx + 1}`,
            countryCode: cCode,
            countryName: name,
            coordinates: subPoly,
            area,
            center,
            neighbors: [],
          });
        });
      });
    });

    buildSpatialNeighbors(phase3Regions);

    return NextResponse.json({
      success: true,
      phase1: phase1Countries,
      phase2: phase2Islands,
      phase3: phase3Regions,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
