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
    const map1Dir = path.join(publicDir, "maps", "map1");
    await fs.mkdir(map1Dir, { recursive: true });
    await fs.writeFile(path.join(map1Dir, "default-mask.png"), pngBuffer);
  }
}
