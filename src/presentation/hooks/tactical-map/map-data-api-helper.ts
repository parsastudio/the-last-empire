export class MapDataApiHelper {
  public getApiPath(mapMode: string): string {
    if (mapMode === "partition") {
      return "/partition-mask/mappings.json";
    }
    if (mapMode === "edited") {
      return "/api/map-generator?type=edited";
    }
    return "/api/map-generator";
  }

  public getImageSource(mapMode: string): string {
    if (mapMode === "partition") {
      return "/partition-mask/world-mask.png";
    }
    if (mapMode === "edited") {
      return "/edited-mask/world-mask.png";
    }
    return "/test6/world-mask.png";
  }
}
