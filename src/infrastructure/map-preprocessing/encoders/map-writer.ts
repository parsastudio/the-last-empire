import fs from "fs/promises";
import path from "path";
import { encodePng } from "./png-encoder";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export class MapWriter {
  public async saveMaskImage(
    width: number,
    height: number,
    buffer: Uint8Array,
    mapId = "map1",
    mode = "default",
  ): Promise<void> {
    const palette: [number, number, number][] = [];
    for (let i = 0; i < 256; i++) {
      palette.push([0, 0, i]);
    }

    const pngBuffer = encodePng(width, height, buffer, palette);
    const targetDir = MapPathResolver.getMapServerDir(mapId, mode);
    await fs.mkdir(targetDir, { recursive: true });

    const filename = mode === "edited" ? "edited-mask.png" : "default-mask.png";
    await fs.writeFile(path.join(targetDir, filename), pngBuffer);
  }
}
