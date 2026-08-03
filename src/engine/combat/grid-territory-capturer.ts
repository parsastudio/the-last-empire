import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export class GridTerritoryCapturer {
  private facade = new BitPackedStateFacade();

  public captureTerritory(
    attackerId: string,
    defenderId: string,
    targetAreaSqKm: number,
  ): number {
    const attackerNum = NationIdResolver.resolveNumericId(attackerId);
    const defenderNum = NationIdResolver.resolveNumericId(defenderId);

    if (attackerNum === 0 || defenderNum === 0) {
      return 0;
    }

    return this.facade.conquerAndRefreshed(
      attackerNum,
      defenderNum,
      targetAreaSqKm,
    );
  }
}
