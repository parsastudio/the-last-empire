import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export class GridTerritoryCapturer {
  private facade = new BitPackedStateFacade();

  public captureTerritory(
    attackerId: string,
    defenderId: string,
    targetAreaSqKm: number,
  ): number {
    const canonicalAttacker = NationIdResolver.resolveCanonicalId(attackerId);
    const canonicalDefender = NationIdResolver.resolveCanonicalId(defenderId);

    const attackerNum = parseInt(canonicalAttacker.replace("NATION_", ""), 10);
    const defenderNum = parseInt(canonicalDefender.replace("NATION_", ""), 10);

    if (isNaN(attackerNum) || isNaN(defenderNum)) {
      return 0;
    }

    return this.facade.conquerAndRefreshed(
      attackerNum,
      defenderNum,
      targetAreaSqKm,
    );
  }
}
