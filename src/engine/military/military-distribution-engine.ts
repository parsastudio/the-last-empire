import { MilitaryStack } from "@/domain/military/military.schema";

export class MilitaryDistributionEngine {
  public static calculateStartingStack(
    militaryTier: number,
    hasSeaAccess: boolean = true,
  ): MilitaryStack {
    const safeTier = Math.max(1, Math.min(20, militaryTier || 1));
    const techLevel = Math.max(1, Math.min(5, Math.ceil(safeTier / 4)));
    const basePoints = safeTier * 12;

    const infantry = Math.max(10, Math.floor(basePoints * 1.5));
    const droneMissile = Math.floor(basePoints * 0.2);

    let armor = safeTier >= 5 ? Math.floor(basePoints * 0.4) : 0;
    let airDefense = safeTier >= 5 ? Math.floor(basePoints * 0.25) : 0;
    const airForce = safeTier >= 9 ? Math.floor(basePoints * 0.2) : 0;

    let navalFleet = 0;
    if (hasSeaAccess && safeTier >= 13) {
      navalFleet = Math.floor(basePoints * 0.1);
    } else {
      const extraPoints = Math.floor(basePoints * 0.1);
      armor += Math.floor(extraPoints * 0.6);
      airDefense += Math.floor(extraPoints * 0.4);
    }

    return {
      infantry,
      armor,
      airDefense,
      airForce,
      droneMissile,
      navalFleet,
      experience: 10,
      techLevel,
    };
  }
}
