import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";

export class BitPackedStorageAdapter {
  private adapter = new GameStorageAdapter();

  public async saveBitBuffer(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<void> {
    if (typeof window === "undefined") return;
    await this.adapter.saveBitBuffer(gameId, buffer);
  }

  public async loadBitBuffer(
    gameId: string,
    buffer: BitPackedBuffer,
  ): Promise<boolean> {
    if (typeof window === "undefined") return false;
    return this.adapter.loadBitBuffer(gameId, buffer);
  }
}
