export class BitPackedCellUtility {
  public static readonly WATER_PROVINCE_ID = 0;

  public static readonly COASTAL_NONE = 0;
  public static readonly COASTAL_OPEN_WATER = 1;
  public static readonly COASTAL_CLOSED_WATER = 2;

  private static readonly PROVINCE_MASK = 0x0fff;

  public static getProvinceId(packed: number): number {
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static getNationId(packed: number): number {
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static setNationId(packed: number, nationId: number): number {
    return (
      (packed & ~BitPackedCellUtility.PROVINCE_MASK) |
      (nationId & BitPackedCellUtility.PROVINCE_MASK)
    );
  }

  public static setEnclaveId(packed: number, enclaveId: number): number {
    return (packed & ~(0x0f << 12)) | ((enclaveId & 0x0f) << 12);
  }

  public static setFrontier(packed: number, frontier: number): number {
    return (packed & ~(1 << 11)) | ((frontier & 1) << 11);
  }

  public static getCoastalAccess(packed: number): number {
    return (packed >> 12) & 0x03;
  }

  public static setCoastalAccess(
    packed: number,
    coastalAccess: number,
  ): number {
    return (packed & ~(0x03 << 12)) | ((coastalAccess & 0x03) << 12);
  }
}
