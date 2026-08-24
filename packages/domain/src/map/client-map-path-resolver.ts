export class ClientMapPathResolver {
  public static getMapVisualClientUrl(mapId = "map1", filename = ""): string {
    return `/maps/${mapId}/temp/visual/${filename}`;
  }

  public static getMapStrategicClientUrl(
    mapId = "map1",
    filename = "",
  ): string {
    return `/maps/${mapId}/temp/strategic/${filename}`;
  }
}
