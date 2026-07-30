import path from "path";

export class MapPathResolver {
  public static getSubFolder(mode?: string): "essential" | "temp" {
    return mode === "essential" ? "essential" : "temp";
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

  public static getMapServerDir(
    mapId = "map1",
    mode = "partition",
    sub?: string,
  ): string {
    const subFolder = sub === "essential" ? "essential" : "temp";
    return path.join(process.cwd(), "public", "maps", mapId, subFolder, mode);
  }

  public static getMapClientUrl(
    mapId = "map1",
    mode = "partition",
    filename = "",
    sub?: string,
  ): string {
    const subFolder = sub === "essential" ? "essential" : "temp";
    return `/maps/${mapId}/${subFolder}/${mode}/${filename}`;
  }
}
