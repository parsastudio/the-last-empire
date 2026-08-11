import path from "path";

export class MapPathResolver {
  public static getMapFinalServerDir(mapId = "map1"): string {
    return path.join(process.cwd(), "public", "maps", mapId, "temp", "final");
  }

  public static getMapFinalClientUrl(mapId = "map1", filename = ""): string {
    return `/maps/${mapId}/temp/final/${filename}`;
  }
}
