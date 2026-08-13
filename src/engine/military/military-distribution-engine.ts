import { MilitaryStack } from "@/domain/military/military.schema";

export class MilitaryDistributionEngine {
  public static calculateStartingStack(
    militaryTier: number,
    hasSeaAccess: boolean = true,
  ): MilitaryStack {
    const safeTier = Math.max(1, Math.min(20, militaryTier || 1));
    const techLevel = Math.max(1, Math.min(5, Math.ceil(safeTier / 4)));

    const infantry = Math.max(1, Math.floor(safeTier * 2.5));
    const droneMissile = Math.floor(safeTier * 0.5);

    let armor = 0;
    if (techLevel >= 2) {
      armor = Math.floor((safeTier - 4) * 1.5);
    }

    let airDefense = 0;
    if (techLevel >= 3) {
      airDefense = Math.floor((safeTier - 8) * 1.2);
    }

    let airForce = 0;
    if (techLevel >= 4) {
      airForce = Math.floor((safeTier - 12) * 1.5);
    }

    let navalFleet = 0;
    if (techLevel >= 5 && hasSeaAccess) {
      navalFleet = Math.floor((safeTier - 16) * 2.0);
    } else if (techLevel >= 5 && !hasSeaAccess) {
      const redirectedPoints = Math.floor((safeTier - 16) * 2.0);
      armor += Math.floor(redirectedPoints * 0.6);
      airDefense += Math.floor(redirectedPoints * 0.4);
    }

    return {
      infantry,
      armor: Math.max(0, armor),
      airDefense: Math.max(0, airDefense),
      airForce: Math.max(0, airForce),
      droneMissile: Math.max(0, droneMissile),
      navalFleet: Math.max(0, navalFleet),
      experience: 10,
      techLevel,
    };
  }
}
