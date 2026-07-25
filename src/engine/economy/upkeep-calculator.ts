import { Nation } from "@/domain/nation/nation.schema";
import { TraitManager } from "@/engine/politics/trait-manager";
import { GovernmentSystem } from "@/engine/politics/government-system";
import { MilitaryUpkeepCalculator } from "./upkeep/military-upkeep.calculator";
import { InfrastructureUpkeepCalculator } from "./upkeep/infrastructure-upkeep.calculator";

export interface BreakdownUpkeep {
  infantry: number;
  airForce: number;
  droneMissile: number;
  infrastructure: number;
  total: number;
}

export class UpkeepCalculator {
  private traitManager = new TraitManager();
  private governmentSystem = new GovernmentSystem();
  private militaryUpkeep = new MilitaryUpkeepCalculator();
  private infraUpkeep = new InfrastructureUpkeepCalculator();

  public calculateUpkeep(nation: Nation): BreakdownUpkeep {
    const traitMultiplier = this.traitManager.getUpkeepMultiplier(nation);
    const govTraits = this.governmentSystem.getTraits(nation.government.type);

    const totalMilitaryCost = this.militaryUpkeep.calculateMilitaryCost(
      nation,
      traitMultiplier,
      govTraits.militaryUpkeepMultiplier,
    );

    const infrastructure = this.infraUpkeep.calculateInfrastructureCost(
      nation,
      nation.upkeep.infrastructureUpkeep,
    );

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
