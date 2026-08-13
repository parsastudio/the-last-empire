import { MilitaryStack, UnitType } from "@/domain/military/military.schema";

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

  public static getBreakdown(
    military: MilitaryStack,
    unitType: UnitType,
  ): Record<number, number> {
    const key = this.getStackKey(unitType);
    const result: Record<number, number> = {};
    const totalCount = military[key] ?? 0;
    if (totalCount <= 0) return result;

    const rawUnitInventory = military.inventory?.[unitType];
    let recordedSum = 0;

    if (rawUnitInventory) {
      const keys = Object.keys(rawUnitInventory);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i]!;
        const level = parseInt(k, 10);
        const count = rawUnitInventory[k] ?? 0;
        if (!isNaN(level) && level > 0 && count > 0) {
          result[level] = (result[level] ?? 0) + count;
          recordedSum += count;
        }
      }
    }

    if (recordedSum < totalCount) {
      const fallbackLevel = Math.max(1, military.techLevel ?? 1);
      const remaining = totalCount - recordedSum;
      result[fallbackLevel] = (result[fallbackLevel] ?? 0) + remaining;
    }

    return result;
  }

  public static addUnits(
    military: MilitaryStack,
    unitType: UnitType,
    quantity: number,
    techLevel: number,
  ): MilitaryStack {
    if (quantity <= 0) return military;
    const key = this.getStackKey(unitType);
    const safeTech = Math.max(1, Math.floor(techLevel));
    const breakdown = this.getBreakdown(military, unitType);
    breakdown[safeTech] = (breakdown[safeTech] ?? 0) + quantity;

    const updatedInventory = { ...(military.inventory ?? {}) };
    const stringifiedRecord: Record<string, number> = {};
    const levels = Object.keys(breakdown).map(Number);
    for (let i = 0; i < levels.length; i++) {
      const lvl = levels[i]!;
      const count = breakdown[lvl]!;
      if (count > 0) {
        stringifiedRecord[lvl.toString()] = count;
      }
    }
    updatedInventory[unitType] = stringifiedRecord;

    return {
      ...military,
      [key]: (military[key] ?? 0) + quantity,
      inventory: updatedInventory,
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

    const toRemove = Math.min(totalCount, quantityToRemove);
    const breakdown = this.getBreakdown(military, unitType);
    let remainingToRemove = toRemove;

    const levels = Object.keys(breakdown)
      .map(Number)
      .sort((a, b) => a - b);

    for (let i = 0; i < levels.length; i++) {
      if (remainingToRemove <= 0) break;
      const lvl = levels[i]!;
      const currentCount = breakdown[lvl]!;
      if (currentCount <= remainingToRemove) {
        remainingToRemove -= currentCount;
        delete breakdown[lvl];
      } else {
        breakdown[lvl] = currentCount - remainingToRemove;
        remainingToRemove = 0;
      }
    }

    const updatedInventory = { ...(military.inventory ?? {}) };
    const stringifiedRecord: Record<string, number> = {};
    const remainingLevels = Object.keys(breakdown).map(Number);
    for (let i = 0; i < remainingLevels.length; i++) {
      const lvl = remainingLevels[i]!;
      const count = breakdown[lvl]!;
      if (count > 0) {
        stringifiedRecord[lvl.toString()] = count;
      }
    }
    updatedInventory[unitType] = stringifiedRecord;

    return {
      ...military,
      [key]: Math.max(0, totalCount - toRemove),
      inventory: updatedInventory,
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
