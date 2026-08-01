import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export interface BreakdownUpkeep {
  infantry: number;
  airForce: number;
  droneMissile: number;
  infrastructure: number;
  total: number;
}

export class UpkeepCalculator {
  private governmentSystem = new GovernmentSystem();

  public calculateUpkeep(nation: Nation): BreakdownUpkeep {
    let traitMultiplier = 1.0;
    if (nation.traits.includes("MILITARISTIC")) {
      traitMultiplier -= 0.15;
    }

    const govTraits = this.governmentSystem.getTraits(nation.government.type);

    const baseMilitaryWeight =
      nation.military.infantry * MILITARY_UNIT_STATS.INFANTRY.weightPower +
      nation.military.airForce * MILITARY_UNIT_STATS.AIR_FORCE.weightPower +
      nation.military.droneMissile *
        MILITARY_UNIT_STATS.DRONE_MISSILE.weightPower;

    const techMultiplier = 1 + (nation.military.techLevel - 1) * 0.2;

    const totalMilitaryCost = Math.floor(
      baseMilitaryWeight *
        12 *
        techMultiplier *
        traitMultiplier *
        govTraits.militaryUpkeepMultiplier,
    );

    const baseInfraUpkeep =
      nation.geography.infrastructureLevel *
      nation.upkeep.infrastructureUpkeep *
      15000;
    const sizeFactor = 1 + Math.log10(nation.geography.territorySize + 1) * 0.5;
    const infrastructure = Math.floor(baseInfraUpkeep * sizeFactor);

    let adminPenalty = 0;
    if (nation.taxRate < 5) {
      adminPenalty = Math.floor(nation.gdp * 0.01 * (5 - nation.taxRate));
    }

    const total = totalMilitaryCost + infrastructure + adminPenalty;

    return {
      infantry: Math.floor(totalMilitaryCost * 0.5),
      airForce: Math.floor(totalMilitaryCost * 0.35),
      droneMissile: Math.floor(totalMilitaryCost * 0.15),
      infrastructure,
      total,
    };
  }
}
