export class BitPackedCellUtility {
  public static readonly WATER_PROVINCE_ID = 0;

  public static readonly COASTAL_NONE = 0;
  public static readonly COASTAL_OPEN_WATER = 1;
  public static readonly COASTAL_CLOSED_WATER = 2;

  public static getProvinceId(packed: number): number {
    return packed & 0xffff;
  }

  public static setProvinceId(packed: number, provinceId: number): number {
    return provinceId & 0xffff;
  }

  public static getNationId(packed: number): number {
    return packed & 0xffff;
  }

  public static setNationId(packed: number, nationId: number): number {
    return nationId & 0xffff;
  }

  public static getEnclaveId(packed: number): number {
    return (packed & 0x1f00) >> 8;
  }

  public static setEnclaveId(packed: number, enclaveId: number): number {
    return (packed & ~0x1f00) | ((enclaveId & 0x001f) << 8);
  }

  public static getFrontier(packed: number): number {
    return (packed & 0x2000) >> 13;
  }

  public static setFrontier(packed: number, frontier: number): number {
    return (packed & ~0x2000) | ((frontier & 0x0001) << 13);
  }

  public static getCoastalAccess(packed: number): number {
    return (packed & 0xc000) >> 14;
  }

  public static setCoastalAccess(
    packed: number,
    coastalAccess: number,
  ): number {
    return (packed & ~0xc000) | ((coastalAccess & 0x0003) << 14);
  }
}
