import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class BitPackedGridState {
  private static instance: BitPackedGridState | null = null;
  private buffer: BitPackedBuffer;
  private activeGameId: string | null = null;
  private modifiedIndices = new Set<number>();
  private version = 0;
  private dirtyStorage = false;

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

  public markStorageDirty(): void {
    this.dirtyStorage = true;
  }

  public isStorageDirty(): boolean {
    return this.dirtyStorage;
  }

  public getActiveGameId(): string | null {
    return this.activeGameId;
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
    this.dirtyStorage = true;
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
    this.dirtyStorage = true;
    this.markDirty();
  }

  public setNationId(x: number, y: number, nationId: number): void {
    const oldVal = this.buffer.getNationId(x, y);
    if (oldVal !== nationId) {
      this.buffer.setNationId(x, y, nationId);
      this.markModified(x, y);
    }
  }
}
