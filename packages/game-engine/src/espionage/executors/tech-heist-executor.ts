import { Nation } from "@/domain/nation/nation.schema";
import {
  EspionageOutcome,
  EspionageTechTheftData,
} from "@/domain/espionage/espionage.schema";
import { TechSuperiorityDelta } from "@/engine/espionage/espionage-calculator";
import { InfrastructureManager } from "@/engine/economy/calculators/infrastructure-manager";
import { GdpCalculator } from "@/engine/economy/calculators/gdp-calculator";

export class TechHeistExecutor {
  public static execute(
    source: Nation,
    target: Nation,
    superiority: TechSuperiorityDelta,
    isSuccess: boolean,
    outcome: EspionageOutcome,
  ): {
    updatedSource: Nation;
    updatedTarget: Nation;
    techTheftData?: EspionageTechTheftData;
    message: string;
  } {
    if (!isSuccess) {
      return {
        updatedSource: source,
        updatedTarget: target,
        message: `نفوذ به سرورهای محرمانه ${target.name} شکست خورد و کدهای نفوذی مسدود شدند (-۴۰ دیدگاه، -۱۵ اعتبار جهانی).`,
      };
    }

    const pointsToGrant = Math.min(3, superiority.totalAvailablePoints);
    let remainingPoints = pointsToGrant;

    let gMil = 0;
    let gInd = 0;
    let gInfra = 0;

    let currMilGap = superiority.militaryDelta;
    let currIndGap = superiority.industrialDelta;
    let currInfraGap = superiority.infrastructureDelta;

    while (remainingPoints > 0) {
      if (currMilGap > 0) {
        gMil++;
        currMilGap--;
        remainingPoints--;
        if (remainingPoints <= 0) break;
      }
      if (currIndGap > 0) {
        gInd++;
        currIndGap--;
        remainingPoints--;
        if (remainingPoints <= 0) break;
      }
      if (currInfraGap > 0) {
        gInfra++;
        currInfraGap--;
        remainingPoints--;
        if (remainingPoints <= 0) break;
      }
      if (currMilGap === 0 && currIndGap === 0 && currInfraGap === 0) {
        break;
      }
    }

    const newTechLevel = source.military.techLevel + gMil;
    const newIndLevel = source.industrialLevel + gInd;
    const newInfraLevel = source.geography.infrastructureLevel + gInfra;

    let nextCapacity = source.maxPopulationCapacity;
    for (let i = 0; i < gInfra; i++) {
      nextCapacity =
        InfrastructureManager.calculateNextCapacityOnUpgrade(nextCapacity);
    }

    let nextProductivity = source.perCapitaProductivity;
    for (let i = 0; i < gInd; i++) {
      nextProductivity =
        GdpCalculator.calculateProductivityOnUpgrade(nextProductivity);
    }

    const updatedSource = GdpCalculator.syncNationGdpAndDemographics(
      {
        ...source,
        industrialLevel: newIndLevel,
        maxPopulationCapacity: nextCapacity,
        military: {
          ...source.military,
          techLevel: newTechLevel,
        },
        geography: {
          ...source.geography,
          infrastructureLevel: newInfraLevel,
        },
      },
      source.population,
      nextProductivity,
    );

    const techTheftData: EspionageTechTheftData = {
      militaryTechGained: gMil,
      industrialLevelGained: gInd,
      infrastructureLevelGained: gInfra,
      totalPointsGained: pointsToGrant,
    };

    const message =
      outcome === "CLEAN_SUCCESS"
        ? `سرقت قرن با موفقیت انجام شد! دانشمندان شما موفق شدند ${pointsToGrant} امتیاز ارتقای فناوری از ${target.name} استخراج و اعمال کنند.`
        : `سرقت فناوری (${pointsToGrant} امتیاز ارتقا) موفق بود اما وزارت اطلاعات ${target.name} عاملان را شناسایی کرد (-۵۰ دیدگاه، -۱۵ اعتبار جهانی).`;

    return { updatedSource, updatedTarget: target, techTheftData, message };
  }
}
