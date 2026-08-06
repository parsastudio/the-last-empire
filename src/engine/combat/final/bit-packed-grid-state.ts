import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class BitPackedGridState {
  private static instance: BitPackedGridState | null = null;
  private buffer: BitPackedBuffer;
  private modifiedIndices = new Set<number>();
  private snapshots = new Map<string, Uint16Array>();

  constructor(
    width: number = MAP_CONFIG.HIGH_RES_WIDTH,
    height: number = MAP_CONFIG.HIGH_RES_HEIGHT,
  ) {
    this.buffer = new BitPackedBuffer(width, height);
  }

  public static getInstance(): BitPackedGridState {
    if (!BitPackedGridState.instance) {
      BitPackedGridState.instance = new BitPackedGridState();
    }
    return BitPackedGridState.instance;
  }

  public getBuffer(): BitPackedBuffer {
    return this.buffer;
  }

  public getModifiedIndices(): ReadonlySet<number> {
    return this.modifiedIndices;
  }

  public markModified(x: number, y: number): void {
    const index = y * this.buffer.getWidth() + x;
    this.modifiedIndices.add(index);
  }

  public clearModifiedIndices(): void {
    this.modifiedIndices.clear();
  }

  public setNationId(x: number, y: number, nationId: number): void {
    const oldVal = this.buffer.getNationId(x, y);
    if (oldVal !== nationId) {
      this.buffer.setNationId(x, y, nationId);
      this.markModified(x, y);
    }
  }

  public saveSnapshot(key: string): void {
    const raw = this.buffer.getRawBuffer();
    const copy = new Uint16Array(raw.length);
    copy.set(raw);
    this.snapshots.set(key, copy);
  }

  public restoreSnapshot(key: string): boolean {
    const snapshot = this.snapshots.get(key);
    if (!snapshot) return false;
    this.buffer.getRawBuffer().set(snapshot);
    this.clearModifiedIndices();
    return true;
  }
}
