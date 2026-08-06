import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";
import { MAP_CONFIG } from "@/domain/map/map.config";

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

  public getNationId(x: number, y: number): number {
    const val = this.getPixel(x, y);
    return BitPackedCellUtility.getNationId(val);
  }

  public setNationId(x: number, y: number, nationId: number): void {
    const index = y * this.width + x;
    if (index >= 0 && index < this.buffer.length) {
      const val = this.buffer[index] || 0;
      this.buffer[index] = BitPackedCellUtility.setNationId(val, nationId);
    }
  }

  public getEnclaveId(x: number, y: number): number {
    const val = this.getPixel(x, y);
    return BitPackedCellUtility.getEnclaveId(val);
  }

  public setEnclaveId(x: number, y: number, enclaveId: number): void {
    const index = y * this.width + x;
    if (index >= 0 && index < this.buffer.length) {
      const val = this.buffer[index] || 0;
      this.buffer[index] = BitPackedCellUtility.setEnclaveId(val, enclaveId);
    }
  }

  public getFrontier(x: number, y: number): number {
    const val = this.getPixel(x, y);
    return BitPackedCellUtility.getFrontier(val);
  }

  public setFrontier(x: number, y: number, frontier: number): void {
    const index = y * this.width + x;
    if (index >= 0 && index < this.buffer.length) {
      const val = this.buffer[index] || 0;
      this.buffer[index] = BitPackedCellUtility.setFrontier(val, frontier);
    }
  }

  public getCoastalAccess(x: number, y: number): number {
    const val = this.getPixel(x, y);
    return BitPackedCellUtility.getCoastalAccess(val);
  }

  public setCoastalAccess(x: number, y: number, coastalAccess: number): void {
    const index = y * this.width + x;
    if (index >= 0 && index < this.buffer.length) {
      const val = this.buffer[index] || 0;
      this.buffer[index] = BitPackedCellUtility.setCoastalAccess(
        val,
        coastalAccess,
      );
    }
  }

  public loadArrayBuffer(arrayBuffer: ArrayBuffer): void {
    this.buffer = new Uint16Array(arrayBuffer);
  }

  public toUint8ArrayBuffer(): Uint8Array {
    return new Uint8Array(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength,
    );
  }
}
