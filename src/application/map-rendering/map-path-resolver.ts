import path from "path";

export class MapPathResolver {
  public static getSubFolder(mode: string): "essential" | "temp" {
    if (mode === "default" || mode === "edited") {
      return "essential";
    }
    return "temp";
  }

  public static getGeoJsonServerPath(): string {
    return path.join(
      process.cwd(),
      "public",
      "maps",
      "map1",
      "essential",
      "ne_110m_admin_0_countries.geojson",
    );
  }

  public static getMapServerDir(mapId = "map1", mode = "partition"): string {
    const subFolder = this.getSubFolder(mode);
    return path.join(process.cwd(), "public", "maps", mapId, subFolder);
  }

  public static getMapClientUrl(
    mapId = "map1",
    mode = "partition",
    filename = "",
  ): string {
    const subFolder = this.getSubFolder(mode);
    return `/maps/${mapId}/${subFolder}/${filename}`;
  }
}
