import path from "path";
import fs from "fs";

export class ServerMapPathResolver {
  private static findMapsBaseDir(mapId = "map1"): string {
    const candidates = [
      path.join(process.cwd(), "apps", "web", "public", "maps", mapId),
      path.join(process.cwd(), "public", "maps", mapId),
      path.join(
        process.cwd(),
        "..",
        "..",
        "apps",
        "web",
        "public",
        "maps",
        mapId,
      ),
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "apps",
        "web",
        "public",
        "maps",
        mapId,
      ),
    ];

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i]!;
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    let current = process.cwd();
    for (let i = 0; i < 5; i++) {
      const webMapsPath = path.join(
        current,
        "apps",
        "web",
        "public",
        "maps",
        mapId,
      );
      if (fs.existsSync(webMapsPath)) {
        return webMapsPath;
      }
      const directMapsPath = path.join(current, "public", "maps", mapId);
      if (fs.existsSync(directMapsPath)) {
        return directMapsPath;
      }
      current = path.dirname(current);
    }

    const defaultPath = path.join(
      process.cwd(),
      "apps",
      "web",
      "public",
      "maps",
      mapId,
    );
    fs.mkdirSync(defaultPath, { recursive: true });
    return defaultPath;
  }

  public static getMapDir(mapId = "map1"): string {
    return this.findMapsBaseDir(mapId);
  }

  public static getMapEssentialServerDir(mapId = "map1"): string {
    const essentialDir = path.join(this.getMapDir(mapId), "essential");
    if (!fs.existsSync(essentialDir)) {
      fs.mkdirSync(essentialDir, { recursive: true });
    }
    return essentialDir;
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
    const essentialDir = this.getMapEssentialServerDir(mapId);

    const candidatePaths = [
      path.join(essentialDir, "base_map_terrain.png"),
      path.join(essentialDir, "base-map-terrain.png"),
      path.join(essentialDir, "terrain.png"),
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

  public static getEditedMaskServerPath(mapId = "map1"): string {
    const mapDir = this.getMapDir(mapId);
    const tempDir = this.getMapTempServerDir(mapId);
    const essentialDir = this.getMapEssentialServerDir(mapId);

    const candidatePaths = [
      path.join(essentialDir, "edited-mask.png"),
      path.join(essentialDir, "edited_mask.png"),
      path.join(essentialDir, "mask.png"),
      path.join(essentialDir, "map_mask.png"),
      path.join(tempDir, "edited_mask.png"),
      path.join(tempDir, "edited-mask.png"),
      path.join(tempDir, "mask.png"),
      path.join(tempDir, "map_mask.png"),
      path.join(mapDir, "edited_mask.png"),
      path.join(mapDir, "edited-mask.png"),
      path.join(mapDir, "mask.png"),
      path.join(mapDir, "map_mask.png"),
    ];

    for (let i = 0; i < candidatePaths.length; i++) {
      const fullPath = candidatePaths[i]!;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    const defaultPath = path.join(essentialDir, "edited-mask.png");
    if (!fs.existsSync(defaultPath)) {
      throw new Error(
        `فایل ماسک تصویر نقشه در هیچ‌یک از مسیرهای متداول مانند ${defaultPath} یافت نشد.`,
      );
    }

    return defaultPath;
  }
}
