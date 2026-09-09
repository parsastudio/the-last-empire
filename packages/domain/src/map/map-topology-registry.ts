import {
  ProvinceStaticTopology,
  ProvinceDynamicState,
  Province,
} from "@/domain/province/province.schema";
import {
  FinalMapManifest,
  FinalManifestProvince,
} from "@/domain/map/manifest.type";

export class MapTopologyRegistry {
  private static readonly topologyMap = new Map<
    number,
    ProvinceStaticTopology
  >();
  private static isLoaded = false;

  public static initializeFromManifest(
    manifest: FinalMapManifest | null,
  ): void {
    if (!manifest || !Array.isArray(manifest.provinces)) {
      return;
    }

    this.topologyMap.clear();

    for (let i = 0; i < manifest.provinces.length; i++) {
      const p = manifest.provinces[i]!;
      this.registerManifestProvince(p);
    }

    this.isLoaded = true;
  }

  public static registerManifestProvince(p: FinalManifestProvince): void {
    const topology: ProvinceStaticTopology = {
      provinceId: p.provinceId,
      nameFa: p.nameFa,
      pixelCount: p.pixelCount,
      hasSeaAccess: p.hasSeaAccess,
      landNeighbors: p.landNeighbors || [],
      maritimeNeighborsTier1: p.maritimeNeighborsTier1 || [],
      maritimeNeighborsTier2: p.maritimeNeighborsTier2 || [],
      centerCoordinates: p.centerCoordinates,
      population: p.population || 1000000,
      maxSlots: p.maxSlots || 1,
    };

    this.topologyMap.set(p.provinceId, topology);
  }

  public static registerProvinceTopology(
    topology: ProvinceStaticTopology,
  ): void {
    this.topologyMap.set(topology.provinceId, topology);
  }

  public static getTopology(
    provinceId: number,
  ): ProvinceStaticTopology | undefined {
    return this.topologyMap.get(provinceId);
  }

  public static requireTopology(provinceId: number): ProvinceStaticTopology {
    const topology = this.topologyMap.get(provinceId);
    if (!topology) {
      throw new Error(
        `Province static topology not found for id ${provinceId}`,
      );
    }
    return topology;
  }

  public static getNameFa(provinceId: number, fallback = ""): string {
    return this.topologyMap.get(provinceId)?.nameFa ?? fallback;
  }

  public static getPixelCount(provinceId: number, fallback = 0): number {
    return this.topologyMap.get(provinceId)?.pixelCount ?? fallback;
  }

  public static hasSeaAccess(provinceId: number, fallback = false): boolean {
    return this.topologyMap.get(provinceId)?.hasSeaAccess ?? fallback;
  }

  public static getLandNeighbors(provinceId: number): number[] {
    return this.topologyMap.get(provinceId)?.landNeighbors ?? [];
  }

  public static getMaritimeNeighborsTier1(provinceId: number): number[] {
    return this.topologyMap.get(provinceId)?.maritimeNeighborsTier1 ?? [];
  }

  public static getMaritimeNeighborsTier2(provinceId: number): number[] {
    return this.topologyMap.get(provinceId)?.maritimeNeighborsTier2 ?? [];
  }

  public static getPopulation(provinceId: number, fallback = 1000000): number {
    return this.topologyMap.get(provinceId)?.population ?? fallback;
  }

  public static getMaxSlots(provinceId: number, fallback = 1): number {
    return this.topologyMap.get(provinceId)?.maxSlots ?? fallback;
  }

  public static getCenterCoordinates(
    provinceId: number,
    fallback = { x: 0, y: 0 },
  ): { x: number; y: number } {
    return this.topologyMap.get(provinceId)?.centerCoordinates ?? fallback;
  }

  public static getAllTopology(): ProvinceStaticTopology[] {
    return Array.from(this.topologyMap.values());
  }

  public static isReady(): boolean {
    return this.isLoaded && this.topologyMap.size > 0;
  }

  public static composeProvince(dynamic: ProvinceDynamicState): Province {
    const topo = this.topologyMap.get(dynamic.provinceId);
    if (!topo) {
      return {
        ...dynamic,
        nameFa: `استان ${dynamic.provinceId}`,
        pixelCount: 0,
        hasSeaAccess: false,
        landNeighbors: [],
        maritimeNeighborsTier1: [],
        maritimeNeighborsTier2: [],
        centerCoordinates: { x: 0, y: 0 },
        population: 1000000,
        maxSlots: 1,
      };
    }

    return {
      ...dynamic,
      nameFa: topo.nameFa,
      pixelCount: topo.pixelCount,
      hasSeaAccess: topo.hasSeaAccess,
      landNeighbors: topo.landNeighbors,
      maritimeNeighborsTier1: topo.maritimeNeighborsTier1,
      maritimeNeighborsTier2: topo.maritimeNeighborsTier2,
      centerCoordinates: topo.centerCoordinates,
      population: topo.population,
      maxSlots: topo.maxSlots,
    };
  }
}
