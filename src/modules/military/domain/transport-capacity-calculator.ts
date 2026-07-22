import type { MilitaryStack } from "@/modules/military/schemas/military.schema";

export class TransportCapacityCalculator {
  public calculateGroundMobility(military: MilitaryStack): number {
    const baseMobility = 1.0;
    const airSupportBonus = Math.min(0.5, military.airForce * 0.01);
    return Number(
      (baseMobility + airSupportBonus + military.mobility * 0.1).toFixed(2),
    );
  }

  public calculateNavalTransportCapacity(military: MilitaryStack): number {
    const capacityPerNavyUnit = 50;
    return military.navy * capacityPerNavyUnit;
  }

  public canTransportAcrossSea(
    military: MilitaryStack,
    troopsCount: number,
  ): boolean {
    const capacity = this.calculateNavalTransportCapacity(military);
    return capacity >= troopsCount;
  }
}
