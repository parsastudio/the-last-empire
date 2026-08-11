export class MapPathResolver {
  public static getMapFinalClientUrl(mapId = "map1", filename = ""): string {
    return `/maps/${mapId}/temp/final/${filename}`;
  }
}
