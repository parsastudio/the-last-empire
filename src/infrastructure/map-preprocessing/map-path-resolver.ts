import path from "path";

export class MapPathResolver {
  public static getSubFolder(_mode: string): "essential" | "temp" {
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

  public static getEditedMaskServerPath(): string {
    return path.join(
      process.cwd(),
      "public",
      "maps",
      "map1",
      "essential",
      "edited-mask.png",
    );
  }

  public static getMapServerDir(mapId = "map1", mode = "partition"): string {
    if (mode === "essential") {
      return path.join(process.cwd(), "public", "maps", mapId, "essential");
    }
    return path.join(process.cwd(), "public", "maps", mapId, "temp");
  }

  public static getMapClientUrl(
    mapId = "map1",
    mode = "partition",
    filename = "",
  ): string {
    return `/maps/${mapId}/temp/${filename}`;
  }
}
