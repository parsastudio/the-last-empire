import type { MilitaryStack } from "@/core/types/military.types";

export interface AirSuperiorityResult {
  attackerHasSuperiority: boolean;
  defenderDefenseDebuff: number;
}

export class AirSuperiorityCalculator {
  public evaluateAirSuperiority(
    attackerMilitary: MilitaryStack,
    defenderMilitary: MilitaryStack,
  ): AirSuperiorityResult {
    const attackerAir = attackerMilitary.airForce;
    const defenderAir = defenderMilitary.airForce;

    if (attackerAir > defenderAir) {
      const difference = attackerAir - defenderAir;
      const debuff = Math.min(0.3, difference * 0.02);
      return {
        attackerHasSuperiority: true,
        defenderDefenseDebuff: Number(debuff.toFixed(2)),
      };
    }

    return {
      attackerHasSuperiority: false,
      defenderDefenseDebuff: 0,
    };
  }
}
