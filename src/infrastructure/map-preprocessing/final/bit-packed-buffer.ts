import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import { MAP_CONFIG } from "@/domain/map/map.config";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export class BitPackedBuffer {
  private buffer: Uint16Array;
  private readonly width: number;
  private readonly height: number;

  constructor(
    width: number = MAP_CONFIG.HIGH_RES_WIDTH,
    height: number = MAP_CONFIG.HIGH_RES_HEIGHT,
  ) {
    this.width = width;
    this.height = height;
    this.buffer = new Uint16Array(width * height);
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public getRawBuffer(): Uint16Array {
    return this.buffer;
  }

  public getPixel(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0;
    }
    return this.buffer[y * this.width + x] || 0;
  }

  public setPixel(x: number, y: number, value: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.buffer[y * this.width + x] = value & 0xffff;
  }

  public getProvinceId(x: number, y: number): number {
    const val = this.getPixel(x, y);
    return BitPackedCellUtility.getProvinceId(val);
  }

  public loadArrayBuffer(arrayBuffer: ArrayBuffer): void {
    this.buffer = new Uint16Array(arrayBuffer);
    BitPackedGridState.getInstance().markDirty();
  }

  public toUint8ArrayBuffer(): Uint8Array {
    return new Uint8Array(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );
  }
}
