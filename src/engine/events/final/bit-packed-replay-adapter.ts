import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import {
  BitPackedDeltaEngine,
  BitPackedDeltaPatch,
} from "@/engine/events/final/bit-packed-delta-engine";

export class BitPackedReplayAdapter {
  private deltaEngine = new BitPackedDeltaEngine();

  public applyHistoricalPatches(
    buffer: BitPackedBuffer,
    patchSets: BitPackedDeltaPatch[][],
  ): void {
    for (let i = 0; i < patchSets.length; i++) {
      const patches = patchSets[i];
      if (patches && patches.length > 0) {
        this.deltaEngine.applyDeltas(buffer, patches);
      }
    }
  }
}
