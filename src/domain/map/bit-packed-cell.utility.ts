export class BitPackedCellUtility {
  public static readonly WATER_PROVINCE_ID = 0;

  public static getProvinceId(packed: number): number {
    return packed & 0xffff;
  }

  public static setProvinceId(packed: number, provinceId: number): number {
    return provinceId & 0xffff;
  }
}
