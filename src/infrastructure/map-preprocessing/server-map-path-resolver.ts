import path from "path";
import fs from "fs";

export class ServerMapPathResolver {
  public static getMapDir(mapId = "map1"): string {
    return path.join(process.cwd(), "public", "maps", mapId);
  }

  public static getMapTempServerDir(mapId = "map1"): string {
    const tempDir = path.join(this.getMapDir(mapId), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
  }

  public static getMapFinalServerDir(mapId = "map1"): string {
    const finalDir = path.join(this.getMapTempServerDir(mapId), "final");
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    return finalDir;
  }

  public static getTerrainServerPath(mapId = "map1"): string | null {
    const mapDir = this.getMapDir(mapId);
    const tempDir = this.getMapTempServerDir(mapId);

    const candidatePaths = [
      path.join(tempDir, "base_map_terrain.png"),
      path.join(tempDir, "base-map-terrain.png"),
      path.join(mapDir, "base_map_terrain.png"),
      path.join(mapDir, "base-map-terrain.png"),
    ];

    for (let i = 0; i < candidatePaths.length; i++) {
      const fullPath = candidatePaths[i]!;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }
}
