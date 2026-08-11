export class BitPackedCellUtility {
  public static readonly WATER_PROVINCE_ID = 0;
  public static readonly RESERVED_NEUTRAL_ID = 1;
  public static readonly RESERVED_SPECIAL_1_ID = 2;
  public static readonly RESERVED_SPECIAL_2_ID = 3;
  public static readonly RESERVED_SPECIAL_3_ID = 4;
  public static readonly FIRST_PROVINCE_ID = 5;

  private static readonly PROVINCE_MASK = 0x0fff;

  public static getProvinceId(packed: number): number {
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static getNationId(packed: number): number {
    return packed & BitPackedCellUtility.PROVINCE_MASK;
  }

  public static setNationId(packed: number, nationId: number): number {
    return nationId & BitPackedCellUtility.PROVINCE_MASK;
  }
}
