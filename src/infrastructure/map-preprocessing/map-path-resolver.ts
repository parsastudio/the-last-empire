import path from "path";

export class MapPathResolver {
  public static getSubFolder(): "essential" | "temp" {
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

  public static getMapServerDir(mapId = "map1"): string {
    return path.join(
      process.cwd(),
      "public",
      "maps",
      mapId,
      "temp",
      "partition",
    );
  }

  public static getMapClientUrl(mapId = "map1", filename = ""): string {
    return `/maps/${mapId}/temp/partition/${filename}`;
  }
}
