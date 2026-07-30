import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export class MapDataApiHelper {
  public getManifestUrl(mapMode: "default" | "edited" | "partition"): string {
    return MapPathResolver.getMapClientUrl("map1", mapMode, "manifest.json");
  }

  public getMask4KUrl(mapMode: "default" | "edited" | "partition"): string {
    return MapPathResolver.getMapClientUrl("map1", mapMode, "mask-4k.bin");
  }

  public getMask1024Url(mapMode: "default" | "edited" | "partition"): string {
    return MapPathResolver.getMapClientUrl("map1", mapMode, "mask-1024.bin");
  }
}
