export class BitPackedCellUtility {
  public static readonly WATER_PROVINCE_ID = 0;

  public static readonly COASTAL_NONE = 0;
  public static readonly COASTAL_OPEN_WATER = 0;
  public static readonly COASTAL_CLOSED_WATER = 0;

  private static readonly PROVINCE_MASK = 0x0fff;

  public static getProvinceId(packed: number): number {
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static setProvinceId(packed: number, provinceId: number): number {
    void packed;
    return provinceId & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static getNationId(packed: number): number {
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static setNationId(packed: number, nationId: number): number {
    void packed;
    return nationId & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static getEnclaveId(packed: number): number {
    void packed;
    return 0;
  }

  public static setEnclaveId(packed: number, enclaveId: number): number {
    void enclaveId;
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static getFrontier(packed: number): number {
    void packed;
    return 0;
  }

  public static setFrontier(packed: number, frontier: number): number {
    void frontier;
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static getCoastalAccess(packed: number): number {
    void packed;
    return 0;
  }

  public static setCoastalAccess(
    packed: number,
    coastalAccess: number,
  ): number {
    void coastalAccess;
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }
}
