import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export class MapDataApiHelper {
  public getManifestUrl(): string {
    return "/api/map-preprocessing/manifest";
  }

  public getMask4KUrl(): string {
    return MapPathResolver.getMapClientUrl("map1", "mask-4k.bin");
  }

  public getMask1024Url(): string {
    return MapPathResolver.getMapClientUrl("map1", "mask-1024.bin");
  }
}
