import fs from "fs";
import path from "path";
import { MapManifest } from "@/infrastructure/map-preprocessing/generator/map-manifest-builder";
import { MapPathResolver } from "./map-path-resolver";

export class ManifestFileLoader {
  public loadManifest(mapId = "map1"): MapManifest | null {
    try {
      const targetDir = MapPathResolver.getMapServerDir(mapId);
      const manifestPath = path.join(targetDir, "manifest.json");

      if (fs.existsSync(manifestPath)) {
        const raw = fs.readFileSync(manifestPath, "utf-8");
        return JSON.parse(raw) as MapManifest;
      }
    } catch {}
    return null;
  }
}
