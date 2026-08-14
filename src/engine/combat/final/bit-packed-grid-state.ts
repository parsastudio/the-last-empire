import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class BitPackedGridState {
  private static instance: BitPackedGridState | null = null;
  private buffer: BitPackedBuffer;
  private activeGameId: string | null = null;
  private modifiedIndices = new Set<number>();
  private version = 0;

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

  public getVersion(): number {
    return this.version;
  }

  public markDirty(): void {
    this.version++;
  }

  public initializeSession(gameId: string): void {
    if (this.activeGameId !== gameId) {
      this.resetBuffer();
      this.activeGameId = gameId;
    }
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
    this.markDirty();
  }

  public clearModifiedIndices(): void {
    this.modifiedIndices.clear();
  }

  public resetBuffer(): void {
    const raw = this.buffer.getRawBuffer();
    raw.fill(0);
    this.clearModifiedIndices();
    this.activeGameId = null;
    this.markDirty();
  }
}
