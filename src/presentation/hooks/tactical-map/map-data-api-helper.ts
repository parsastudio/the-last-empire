export class MapDataApiHelper {
  public getApiPath(mapMode: "default" | "edited" | "partition"): string {
    if (mapMode === "partition") {
      return "/maps/map1/partition-mappings.json";
    }
    if (mapMode === "edited") {
      return "/api/map-generator?type=edited";
    }
    return "/api/map-generator";
  }

  public getImageSource(mapMode: "default" | "edited" | "partition"): string {
    if (mapMode === "partition") {
      return "/maps/map1/partition-mask.png";
    }
    if (mapMode === "edited") {
      return "/maps/map1/edited-mask.png";
    }
    return "/maps/map1/default-mask.png";
  }
}
