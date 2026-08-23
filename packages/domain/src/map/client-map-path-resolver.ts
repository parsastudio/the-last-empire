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

  public static getMapFinalClientUrl(mapId = "map1", filename = ""): string {
    if (
      filename.endsWith(".png") ||
      filename.startsWith("terrain") ||
      filename.includes("tactical")
    ) {
      return this.getMapVisualClientUrl(mapId, filename);
    }
    return this.getMapStrategicClientUrl(mapId, filename);
  }
}
