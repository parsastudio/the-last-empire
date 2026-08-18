export class BitPackedCellUtility {
  public static readonly WATER_OCEAN_ID = 0;
  public static readonly WATER_LAKE_ID = 1;
  public static readonly FIRST_PROVINCE_ID = 5;

  private static readonly PROVINCE_MASK = 0x0fff;

  public static getProvinceId(packed: number): number {
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }
}
