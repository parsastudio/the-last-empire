import fs from "fs";
import path from "path";
import { MapManifest } from "./generator/map-manifest-builder";

export class ManifestFileLoader {
  public loadManifest(mapId = "map1", mode = "partition"): MapManifest | null {
    try {
      const publicDir = path.join(process.cwd(), "public");
      const manifestPath = path.join(
        publicDir,
        "maps",
        mapId,
        `${mode}-manifest.json`,
      );
      if (fs.existsSync(manifestPath)) {
        const raw = fs.readFileSync(manifestPath, "utf-8");
        return JSON.parse(raw) as MapManifest;
      }

      const defaultPath = path.join(
        publicDir,
        "maps",
        mapId,
        "default-manifest.json",
      );
      if (fs.existsSync(defaultPath)) {
        const raw = fs.readFileSync(defaultPath, "utf-8");
        return JSON.parse(raw) as MapManifest;
      }
    } catch {}
    return null;
  }
}
