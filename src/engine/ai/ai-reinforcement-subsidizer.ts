import { Nation } from "@/domain/nation/nation.schema";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class AIReinforcementSubsidizer {
  public static applySubsidiesAndScaling(
    nation: Nation,
    currentTurn: number,
  ): Nation {
    if (!nation.isAi || !nation.isAlive) return nation;

    let updatedMil = { ...nation.military };
    let techLevel = updatedMil.techLevel;

    if (currentTurn >= 50 && techLevel < 4) {
      techLevel = 4;
    } else if (currentTurn >= 30 && techLevel < 3) {
      techLevel = 3;
    } else if (currentTurn >= 15 && techLevel < 2) {
      techLevel = 2;
    }

    updatedMil.techLevel = techLevel;

    const gdp = getNationGdp(nation);
    const minTreasury = Math.max(1000000000, Math.floor(gdp * 0.04));
    const treasury = Math.max(nation.treasury, minTreasury);

    if (updatedMil.infantry < 5) {
      const needed = 5 - updatedMil.infantry;
      updatedMil = MilitaryInventoryHelper.addUnits(
        updatedMil,
        "INFANTRY",
        needed,
        techLevel,
      );
    }

    if (techLevel >= 2 && (updatedMil.armor || 0) < 2) {
      updatedMil = MilitaryInventoryHelper.addUnits(
        updatedMil,
        "ARMOR",
        2,
        techLevel,
      );
    }

    if (techLevel >= 3 && (updatedMil.airDefense || 0) < 2) {
      updatedMil = MilitaryInventoryHelper.addUnits(
        updatedMil,
        "AIR_DEFENSE",
        2,
        techLevel,
      );
    }

    return {
      ...nation,
      treasury,
      military: updatedMil,
    };
  }
}
