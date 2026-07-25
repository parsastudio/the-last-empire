import fs from "fs/promises";
import path from "path";
import { encodePng } from "./png-encoder";

export class MapWriter {
  public async saveMaskImage(
    width: number,
    height: number,
    buffer: Uint8Array,
    publicDir: string,
  ): Promise<void> {
    const palette: [number, number, number][] = [];
    for (let i = 0; i < 256; i++) {
      palette.push([0, 0, i]);
    }

    const pngBuffer = encodePng(width, height, buffer, palette);
    const test6Dir = path.join(publicDir, "test6");
    await fs.mkdir(test6Dir, { recursive: true });
    await fs.writeFile(path.join(test6Dir, "world-mask.png"), pngBuffer);
  }
}
