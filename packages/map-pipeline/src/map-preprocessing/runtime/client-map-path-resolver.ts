export class ClientMapPathResolver {
  public static getMapFinalClientUrl(mapId = "map1", filename = ""): string {
    return `/maps/${mapId}/temp/final/${filename}`;
  }
}
