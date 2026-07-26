import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";

export interface PixelSovereignty {
  seaAccess: number;
  enclaveId: number;
  nationId: number;
}

export class SpatialBufferEngine {
  private readonly width = 1024;
  private readonly height = 512;
  private readonly stride = 3;
  private buffer: Uint8Array;

  constructor(initialBuffer?: Uint8Array) {
    if (initialBuffer) {
      this.buffer = initialBuffer;
    } else {
      this.buffer = new Uint8Array(this.width * this.height * this.stride);
    }
  }

  public getBuffer(): Uint8Array {
    return this.buffer;
  }

  private getOffset(x: number, y: number): number {
    return (y * this.width + x) * this.stride;
  }

  public getPixel(x: number, y: number): PixelSovereignty {
    const offset = this.getOffset(x, y);
    return {
      seaAccess: this.buffer[offset] ?? 0,
      enclaveId: this.buffer[offset + 1] ?? 0,
      nationId: this.buffer[offset + 2] ?? 0,
    };
  }

  public setNationId(x: number, y: number, nationId: number): void {
    const offset = this.getOffset(x, y);
    this.buffer[offset + 2] = nationId;
  }

  public setEnclaveId(x: number, y: number, enclaveId: number): void {
    const offset = this.getOffset(x, y);
    this.buffer[offset + 1] = enclaveId;
  }

  public setSeaAccess(x: number, y: number, accessType: number): void {
    const offset = this.getOffset(x, y);
    this.buffer[offset] = accessType;
  }

  public parseToGridState(): GridState {
    const gridState = new GridState();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const data = this.getPixel(x, y);
        let ownerId = "WATER";
        if (data.nationId >= 11) {
          ownerId = `NATION_${data.nationId}`;
        } else if (data.seaAccess > 1) {
          ownerId = `GULF_${data.seaAccess}`;
        }

        const cell: GridCell = {
          x,
          y,
          ownerId,
          isOccupied: false,
          occupierId: null,
          highResPixelCount: data.nationId >= 11 ? 16 : 0,
          enclaveId: data.enclaveId,
        };
        gridState.setCell(x, y, cell);
      }
    }
    return gridState;
  }

  public executeConquestBFS(
    start: Coordinate,
    targetNationId: number,
    pixelLimit: number,
  ): Coordinate[] {
    const conquered: Coordinate[] = [];
    const visited = new Uint8Array(this.width * this.height);
    const queue: Coordinate[] = [start];

    visited[start.y * this.width + start.x] = 1;

    while (queue.length > 0 && conquered.length < pixelLimit) {
      const current = queue.shift();
      if (!current) continue;

      const offset = this.getOffset(current.x, current.y);
      const currentNation = this.buffer[offset + 2] ?? 0;

      if (currentNation === targetNationId) {
        conquered.push(current);
      }

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < this.width && n.y >= 0 && n.y < this.height) {
          const vIdx = n.y * this.width + n.x;
          if (visited[vIdx] === 0) {
            visited[vIdx] = 1;
            const nOffset = this.getOffset(n.x, n.y);
            if (this.buffer[nOffset + 2] === targetNationId) {
              queue.push(n);
            }
          }
        }
      }
    }

    return conquered;
  }
}
