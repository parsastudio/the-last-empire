import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export class MapDataApiHelper {
  public getApiPath(mapMode: "default" | "edited" | "partition"): string {
    return MapPathResolver.getMapClientUrl(
      "map1",
      mapMode,
      `${mapMode}-mappings.json`,
    );
  }

  public getImageSource(mapMode: "default" | "edited" | "partition"): string {
    return MapPathResolver.getMapClientUrl(
      "map1",
      mapMode,
      `${mapMode}-mask.png`,
    );
  }
}
