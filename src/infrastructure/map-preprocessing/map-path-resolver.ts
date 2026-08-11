import path from "path";
import fs from "fs";

export class MapPathResolver {
  public static getMapTempServerDir(mapId = "map1"): string {
    return path.join(process.cwd(), "public", "maps", mapId, "temp");
  }

  public static getMapFinalServerDir(mapId = "map1"): string {
    return path.join(process.cwd(), "public", "maps", mapId, "temp", "final");
  }

  public static getEditedMaskServerPath(mapId = "map1"): string {
    const tempDir = this.getMapTempServerDir(mapId);
    const candidateFiles = ["edited_mask.png", "base_map_mask.png", "mask.png"];

    for (let i = 0; i < candidateFiles.length; i++) {
      const filename = candidateFiles[i]!;
      const fullPath = path.join(tempDir, filename);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return path.join(tempDir, "edited_mask.png");
  }

  public static getMapFinalClientUrl(mapId = "map1", filename = ""): string {
    return `/maps/${mapId}/temp/final/${filename}`;
  }
}
