import {
  MilitaryStack,
  UnitType,
  BranchTechRating,
} from "@/domain/military/military.schema";

export type MilitaryStackKey =
  | "infantry"
  | "armor"
  | "airDefense"
  | "airForce"
  | "droneMissile"
  | "navalFleet";

export class MilitaryInventoryHelper {
  public static getStackKey(unitType: UnitType): MilitaryStackKey {
    switch (unitType) {
      case "INFANTRY":
        return "infantry";
      case "ARMOR":
        return "armor";
      case "AIR_DEFENSE":
        return "airDefense";
      case "AIR_FORCE":
        return "airForce";
      case "DRONE_MISSILE":
        return "droneMissile";
      case "NAVAL_FLEET":
        return "navalFleet";
    }
  }

  public static getBranchTech(
    military: MilitaryStack,
    unitType: UnitType,
  ): number {
    const key = this.getStackKey(unitType);
    const customTech = military.branchTech?.[key];
    if (customTech !== undefined && customTech > 0) {
      return Number(customTech.toFixed(2));
    }
    return Math.max(1, military.techLevel ?? 1);
  }

  public static initializeBranchTech(
    baseTechLevel: number = 1,
  ): BranchTechRating {
    const tech = Math.max(1, baseTechLevel);
    return {
      infantry: tech,
      armor: tech,
      airDefense: tech,
      airForce: tech,
      droneMissile: tech,
      navalFleet: tech,
    };
  }

  public static syncBranchTechOnUpgrade(
    military: MilitaryStack,
    newTechLevel: number,
  ): MilitaryStack {
    const safeTech = Math.max(1, newTechLevel);
    const currentBranchTech: BranchTechRating = military.branchTech
      ? { ...military.branchTech }
      : this.initializeBranchTech(military.techLevel);

    const keys: MilitaryStackKey[] = [
      "infantry",
      "armor",
      "airDefense",
      "airForce",
      "droneMissile",
      "navalFleet",
    ];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]!;
      const currentVal = currentBranchTech[key] ?? military.techLevel ?? 1;
      if (currentVal < safeTech) {
        currentBranchTech[key] = safeTech;
      }
    }

    return {
      ...military,
      techLevel: safeTech,
      branchTech: currentBranchTech,
    };
  }

  public static addUnits(
    military: MilitaryStack,
    unitType: UnitType,
    quantity: number,
    incomingTechLevel: number,
  ): MilitaryStack {
    if (quantity <= 0) return military;

    const key = this.getStackKey(unitType);
    const oldCount = military[key] ?? 0;
    const newCount = oldCount + quantity;

    const currentTech = this.getBranchTech(military, unitType);
    const safeIncomingTech = Math.max(1, incomingTechLevel);

    const weightedTech =
      newCount > 0
        ? Number(
            (
              (oldCount * currentTech + quantity * safeIncomingTech) /
              newCount
            ).toFixed(2),
          )
        : safeIncomingTech;

    const currentBranchTech: BranchTechRating = military.branchTech
      ? { ...military.branchTech }
      : this.initializeBranchTech(military.techLevel);

    currentBranchTech[key] = weightedTech;

    return {
      ...military,
      [key]: newCount,
      branchTech: currentBranchTech,
    };
  }

  public static removeUnits(
    military: MilitaryStack,
    unitType: UnitType,
    quantityToRemove: number,
  ): MilitaryStack {
    const key = this.getStackKey(unitType);
    const totalCount = military[key] ?? 0;
    if (quantityToRemove <= 0 || totalCount <= 0) return military;

    const newCount = Math.max(0, totalCount - quantityToRemove);

    return {
      ...military,
      [key]: newCount,
    };
  }

  public static applyCasualties(
    military: MilitaryStack,
    infantryLost: number,
    armorLost: number,
    airDefenseLost: number,
    airForceLost: number,
    dronesUsed: number,
    navalFleetLost: number,
  ): MilitaryStack {
    let current = military;
    if (infantryLost > 0) {
      current = this.removeUnits(current, "INFANTRY", infantryLost);
    }
    if (armorLost > 0) {
      current = this.removeUnits(current, "ARMOR", armorLost);
    }
    if (airDefenseLost > 0) {
      current = this.removeUnits(current, "AIR_DEFENSE", airDefenseLost);
    }
    if (airForceLost > 0) {
      current = this.removeUnits(current, "AIR_FORCE", airForceLost);
    }
    if (dronesUsed > 0) {
      current = this.removeUnits(current, "DRONE_MISSILE", dronesUsed);
    }
    if (navalFleetLost > 0) {
      current = this.removeUnits(current, "NAVAL_FLEET", navalFleetLost);
    }
    return current;
  }
}
