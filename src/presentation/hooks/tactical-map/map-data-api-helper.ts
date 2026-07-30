import { MapPathResolver } from "@/application/map-rendering/map-path-resolver";

export class MapDataApiHelper {
  public getApiPath(mapMode: "default" | "edited" | "partition"): string {
    if (mapMode === "partition") {
      return MapPathResolver.getMapClientUrl(
        "map1",
        mapMode,
        "partition-mappings.json",
      );
    }
    if (mapMode === "edited") {
      return "/api/map-generator?type=edited";
    }
    return "/api/map-generator";
  }

  public getImageSource(mapMode: "default" | "edited" | "partition"): string {
    if (mapMode === "partition") {
      return MapPathResolver.getMapClientUrl(
        "map1",
        mapMode,
        "partition-mask.png",
      );
    }
    if (mapMode === "edited") {
      return MapPathResolver.getMapClientUrl(
        "map1",
        mapMode,
        "edited-mask.png",
      );
    }
    return MapPathResolver.getMapClientUrl("map1", mapMode, "default-mask.png");
  }
}
