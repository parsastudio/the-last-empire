import { EquirectangularProjection } from "./projection";
import type { GridCell } from "@/domain/map/grid.schema";
import type { Province } from "@/domain/map/province.schema";

export interface GeoJsonFeature {
  type: string;
  properties: {
    ISO_A3: string;
    NAME: string;
    POP_EST: number;
    GDP_MD: number;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

export interface GeneratedMapPayload {
  grid: GridCell[][];
  provinces: Record<string, Province>;
}

export class GridGenerator {
  private projection = new EquirectangularProjection();

  public generateGrid(
    geoJson: GeoJsonData,
    width: number,
    height: number,
    survivingNations: Set<string>,
  ): GeneratedMapPayload {
    if (typeof window === "undefined") {
      return { grid: [], provinces: {} };
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (!ctx) {
      throw new Error("CANVAS_CONTEXT_NOT_SUPPORTED");
    }

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, width, height);

    const validFeatures = geoJson.features.filter(
      (f) => f.properties.ISO_A3 && f.properties.ISO_A3 !== "-99",
    );

    const provinces: Record<string, Province> = {};

    validFeatures.forEach((feature, index) => {
      const countryCode = feature.properties.ISO_A3;
      const provinceId = `${countryCode}_P1`;

      const r = (index + 1) & 0xff;
      const g = ((index + 1) >> 8) & 0xff;
      const b = ((index + 1) >> 16) & 0xff;

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = 0.5;

      const geometry = feature.geometry;
      if (geometry.type === "Polygon") {
        this.drawPolygon(
          ctx,
          geometry.coordinates as number[][][],
          width,
          height,
        );
      } else if (geometry.type === "MultiPolygon") {
        (geometry.coordinates as number[][][][]).forEach((polygonCoords) => {
          this.drawPolygon(ctx, polygonCoords, width, height);
        });
      }

      provinces[provinceId] = {
        id: provinceId,
        name: `${feature.properties.NAME} Region`,
        ownerNationId: countryCode,
        gdp: feature.properties.GDP_MD * 1000000,
        population: feature.properties.POP_EST,
        isCapital: true,
        territorySize: 100,
      };
    });

    const imgData = ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    const grid: GridCell[][] = [];

    for (let y = 0; y < height; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];

        if (
          r === undefined ||
          g === undefined ||
          b === undefined ||
          (r === 0 && g === 0 && b === 0)
        ) {
          row.push({ x, y, ownerId: null, provinceId: null, type: "SEA" });
        } else {
          const featureIndex = (r | (g << 8) | (b << 16)) - 1;
          const matchedFeature = validFeatures[featureIndex];
          const ownerId = matchedFeature
            ? matchedFeature.properties.ISO_A3
            : null;
          const provinceId = ownerId ? `${ownerId}_P1` : null;

          row.push({
            x,
            y,
            ownerId,
            provinceId,
            type: "LAND",
          });
        }
      }
      grid.push(row);
    }

    const modifiedGrid = this.swallowDeletedTerritories(
      grid,
      survivingNations,
      width,
      height,
    );

    return {
      grid: modifiedGrid,
      provinces,
    };
  }

  private drawPolygon(
    ctx: CanvasRenderingContext2D,
    coordinates: number[][][],
    width: number,
    height: number,
  ): void {
    coordinates.forEach((ring) => {
      if (ring.length === 0) return;
      ctx.beginPath();
      ring.forEach((coord, idx) => {
        const lon = coord[0];
        const lat = coord[1];
        if (lon !== undefined && lat !== undefined) {
          const projected = this.projection.project(lon, lat, width, height);
          if (idx === 0) {
            ctx.moveTo(projected.x, projected.y);
          } else {
            ctx.lineTo(projected.x, projected.y);
          }
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }

  private swallowDeletedTerritories(
    grid: GridCell[][],
    survivingNations: Set<string>,
    width: number,
    height: number,
  ): GridCell[][] {
    const queue: { x: number; y: number }[] = [];
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[y][x];
        if (cell && cell.type === "LAND") {
          if (cell.ownerId && !survivingNations.has(cell.ownerId)) {
            cell.ownerId = null;
            cell.provinceId = null;
          }
        }
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = grid[y][x];
        if (cell && cell.type === "LAND" && cell.ownerId !== null) {
          let hasEmptyNeighbor = false;
          for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const neighbor = grid[ny]?.[nx];
              if (
                neighbor &&
                neighbor.type === "LAND" &&
                neighbor.ownerId === null
              ) {
                hasEmptyNeighbor = true;
                break;
              }
            }
          }
          if (hasEmptyNeighbor) {
            queue.push({ x, y });
          }
        }
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentCell = grid[current.y]?.[current.x];
      const currentOwner = currentCell?.ownerId;
      const currentProvince = currentCell?.provinceId;

      if (!currentCell || !currentOwner) {
        continue;
      }

      for (const dir of directions) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const neighbor = grid[ny]?.[nx];
          if (
            neighbor &&
            neighbor.type === "LAND" &&
            neighbor.ownerId === null
          ) {
            neighbor.ownerId = currentOwner;
            neighbor.provinceId = currentProvince;
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }

    return grid;
  }
}
