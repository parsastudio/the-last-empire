import { Nation } from "@/domain/nation/nation.schema";
import { EspionageTechTheftData } from "@/domain/espionage/espionage.schema";
import {
  EspionageCalculator,
  TechSuperiorityDelta,
} from "@/engine/espionage/espionage-calculator";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export class TechHeistExecutor {
  public static execute(
    source: Nation,
    target: Nation,
    superiority: TechSuperiorityDelta,
    isSuccess: boolean,
  ): {
    updatedSource: Nation;
    updatedTarget: Nation;
    techTheftData?: EspionageTechTheftData;
    message: string;
  } {
    if (
      !isSuccess ||
      superiority.totalAvailablePoints <
        EspionageCalculator.MIN_TECH_DELTA_FOR_HEIST
    ) {
      return {
        updatedSource: source,
        updatedTarget: target,
        message: "TECH_HEIST_FAILED",
      };
    }

    const milGain = superiority.militaryGain;
    const indGain = superiority.industrialGain;

    let updatedMilitary = source.military;
    if (milGain > 0) {
      const newMilTech = Number(
        (source.military.techLevel + milGain).toFixed(1),
      );
      updatedMilitary = MilitaryInventoryHelper.syncBranchTechOnUpgrade(
        source.military,
        newMilTech,
      );
    }

    let updatedIndustrialLevel = source.industrialLevel;
    if (indGain > 0) {
      updatedIndustrialLevel = Number(
        (source.industrialLevel + indGain).toFixed(1),
      );
    }

    const updatedSource: Nation = {
      ...source,
      military: updatedMilitary,
      industrialLevel: updatedIndustrialLevel,
    };

    const techTheftData: EspionageTechTheftData = {
      militaryTechGained: milGain,
      industrialTechGained: indGain,
      totalPointsGained: superiority.totalAvailablePoints,
    };

    return {
      updatedSource,
      updatedTarget: target,
      techTheftData,
      message: "TECH_HEIST_SUCCESS",
    };
  }
}
