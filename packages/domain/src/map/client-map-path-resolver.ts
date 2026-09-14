export class ClientMapPathResolver {
  public static getMapFinalClientUrl(mapId = "map1", filename = ""): string {
    return `/maps/${mapId}/final/${filename}`;
  }

  public static getMapVisualClientUrl(mapId = "map1", filename = ""): string {
    return `/maps/${mapId}/final/${filename}`;
  }

  public static getMapStrategicClientUrl(
    mapId = "map1",
    filename = "",
  ): string {
    return `/maps/${mapId}/final/${filename}`;
  }

  public static getMapTempVisualClientUrl(
    mapId = "map1",
    filename = "",
  ): string {
    return `/maps/${mapId}/temp/visual/${filename}`;
  }

  public static getMapTempStrategicClientUrl(
    mapId = "map1",
    filename = "",
  ): string {
    return `/maps/${mapId}/temp/strategic/${filename}`;
  }
}
