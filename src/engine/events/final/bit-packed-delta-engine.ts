import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";

export interface BitPackedDeltaPatch {
  index: number;
  oldValue: number;
  newValue: number;
}

export class BitPackedDeltaEngine {
  public computeDeltas(
    prevBuffer: BitPackedBuffer,
    nextBuffer: BitPackedBuffer,
  ): BitPackedDeltaPatch[] {
    const patches: BitPackedDeltaPatch[] = [];
    const prevRaw = prevBuffer.getRawBuffer();
    const nextRaw = nextBuffer.getRawBuffer();
    const length = prevRaw.length;

    for (let i = 0; i < length; i++) {
      const oldVal = prevRaw[i] || 0;
      const newVal = nextRaw[i] || 0;

      if (oldVal !== newVal) {
        patches.push({
          index: i,
          oldValue: oldVal,
          newValue: newVal,
        });
      }
    }

    return patches;
  }

  public applyDeltas(
    targetBuffer: BitPackedBuffer,
    patches: BitPackedDeltaPatch[],
  ): void {
    const targetRaw = targetBuffer.getRawBuffer();
    for (let i = 0; i < patches.length; i++) {
      const p = patches[i]!;
      if (p.index >= 0 && p.index < targetRaw.length) {
        targetRaw[p.index] = p.newValue;
      }
    }
  }
}
