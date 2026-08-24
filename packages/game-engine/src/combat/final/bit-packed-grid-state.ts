import { BitPackedBuffer } from "@/domain/map/bit-packed-buffer";
import { MAP_CONFIG } from "@/domain/map/map.config";

export class BitPackedGridState {
  private static instance: BitPackedGridState | null = null;
  private buffer: BitPackedBuffer;
  private activeGameId: string | null = null;
  private isLoaded = false;
  private version = 0;
  private listeners: Set<(version: number) => void> = new Set();

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
    this.notifyListeners();
  }

  public subscribe(listener: (version: number) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.version);
    }
  }

  public isBufferLoaded(): boolean {
    return this.isLoaded;
  }

  public markLoaded(): void {
    this.isLoaded = true;
    this.markDirty();
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

  public resetBuffer(): void {
    const raw = this.buffer.getRawBuffer();
    raw.fill(0);
    this.activeGameId = null;
    this.isLoaded = false;
    this.markDirty();
  }
}
