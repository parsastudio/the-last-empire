export class BitPackedCellUtility {
  public static readonly NATION_MASK = 0x00ff;
  public static readonly ENCLAVE_MASK = 0x1f00;
  public static readonly FRONTIER_MASK = 0x2000;
  public static readonly COASTAL_MASK = 0xc000;

  public static readonly COASTAL_NONE = 0;
  public static readonly COASTAL_OPEN_WATER = 1;
  public static readonly COASTAL_CLOSED_WATER = 2;

  public static pack(
    nationId: number,
    enclaveId: number,
    frontier: number,
    coastalAccess: number,
  ): number {
    const safeNation = nationId & 0x00ff;
    const safeEnclave = (enclaveId & 0x001f) << 8;
    const safeFrontier = (frontier & 0x0001) << 13;
    const safeCoastal = (coastalAccess & 0x0003) << 14;
    return safeNation | safeEnclave | safeFrontier | safeCoastal;
  }

  public static getNationId(packed: number): number {
    return packed & 0x00ff;
  }

  public static getEnclaveId(packed: number): number {
    return (packed & 0x1f00) >> 8;
  }

  public static getFrontier(packed: number): number {
    return (packed & 0x2000) >> 13;
  }

  public static getCoastalAccess(packed: number): number {
    return (packed & 0xc000) >> 14;
  }

  public static setNationId(packed: number, nationId: number): number {
    return (packed & ~0x00ff) | (nationId & 0x00ff);
  }

  public static setEnclaveId(packed: number, enclaveId: number): number {
    return (packed & ~0x1f00) | ((enclaveId & 0x001f) << 8);
  }

  public static setFrontier(packed: number, frontier: number): number {
    return (packed & ~0x2000) | ((frontier & 0x0001) << 13);
  }

  public static setCoastalAccess(
    packed: number,
    coastalAccess: number,
  ): number {
    return (packed & ~0xc000) | ((coastalAccess & 0x0003) << 14);
  }
}
