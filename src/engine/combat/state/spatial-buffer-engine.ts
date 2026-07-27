import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { SpatialBfsConquest } from "./spatial-bfs-conquest";

export interface PixelSovereignty {
  seaAccess: number;
  enclaveId: number;
  nationId: number;
}

export class SpatialBufferEngine {
  private readonly width = 1024;
  private readonly height = 512;
  private readonly stride = 2;
  private buffer: Uint8Array;
  private bfsConquest = new SpatialBfsConquest();

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
    const geoByte = this.buffer[offset] ?? 0;
    return {
      seaAccess: geoByte & 0x3,
      enclaveId: geoByte >> 2,
      nationId: this.buffer[offset + 1] ?? 0,
    };
  }

  public setNationId(x: number, y: number, nationId: number): void {
    const offset = this.getOffset(x, y);
    this.buffer[offset + 1] = nationId;
  }

  public setEnclaveId(x: number, y: number, enclaveId: number): void {
    const offset = this.getOffset(x, y);
    const geoByte = this.buffer[offset] ?? 0;
    const seaAccess = geoByte & 0x3;
    this.buffer[offset] = (enclaveId << 2) | seaAccess;
  }

  public setSeaAccess(x: number, y: number, accessType: number): void {
    const offset = this.getOffset(x, y);
    const geoByte = this.buffer[offset] ?? 0;
    const enclaveId = geoByte >> 2;
    this.buffer[offset] = (enclaveId << 2) | (accessType & 0x3);
  }

  public parseToGridState(): GridState {
    const gridState = new GridState();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const data = this.getPixel(x, y);
        let ownerId = "WATER";
        if (data.nationId >= 11) {
          ownerId = `NATION_${data.nationId}`;
        } else if (data.seaAccess === 2) {
          ownerId = "CLOSED_SEA";
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
    return this.bfsConquest.execute(
      start,
      targetNationId,
      pixelLimit,
      this.width,
      this.height,
      this.stride,
      this.buffer,
      this.getOffset.bind(this),
    );
  }
}
