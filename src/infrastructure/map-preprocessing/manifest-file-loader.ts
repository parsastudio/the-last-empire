import fs from "fs";
import path from "path";
import { MapManifest } from "@/infrastructure/map-preprocessing/generator/map-manifest-builder";
import { MapPathResolver } from "./map-path-resolver";

export class ManifestFileLoader {
  public loadManifest(mapId = "map1", mode = "partition"): MapManifest | null {
    try {
      const targetDir = MapPathResolver.getMapServerDir(mapId, mode);
      const manifestPath = path.join(targetDir, "manifest.json");

      if (fs.existsSync(manifestPath)) {
        const raw = fs.readFileSync(manifestPath, "utf-8");
        return JSON.parse(raw) as MapManifest;
      }

      const essentialDir = MapPathResolver.getMapServerDir(mapId, "default");
      const defaultPath = path.join(essentialDir, "manifest.json");
      if (fs.existsSync(defaultPath)) {
        const raw = fs.readFileSync(defaultPath, "utf-8");
        return JSON.parse(raw) as MapManifest;
      }
    } catch {}
    return null;
  }
}
