import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  EspionageOutcome,
  EspionageTechTheftData,
} from "@/domain/espionage/espionage.schema";
import { TechSuperiorityDelta } from "@/engine/espionage/espionage-calculator";
import { DevelopmentManager } from "@/engine/economy/calculators/infrastructure-manager";
import { CountryRegistry } from "@/domain/data/countries";

export class TechHeistExecutor {
  public static execute(
    source: Nation,
    target: Nation,
    superiority: TechSuperiorityDelta,
    isSuccess: boolean,
    outcome: EspionageOutcome,
    provincesMap: Record<string, Province>,
  ): {
    updatedSource: Nation;
    updatedTarget: Nation;
    updatedProvinces: Record<string, Province>;
    techTheftData?: EspionageTechTheftData;
    message: string;
  } {
    const updatedProvinces: Record<string, Province> = { ...provincesMap };

    if (!isSuccess) {
      return {
        updatedSource: source,
        updatedTarget: target,
        updatedProvinces,
        message: `نفوذ به سرورهای محرمانه ${target.name} شکست خورد و کدهای نفوذی مسدود شدند (-۴۰ دیدگاه، -۱۵ اعتبار جهانی).`,
      };
    }

    const pointsToGrant = Math.min(2, superiority.totalAvailablePoints);
    let remainingPoints = pointsToGrant;

    let gMil = 0;
    let gInd = 0;

    let currMilGap = superiority.militaryDelta;
    let currIndGap = superiority.industrialDelta;

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
      if (currMilGap === 0 && currIndGap === 0) {
        break;
      }
    }

    const newTechLevel = source.military.techLevel + gMil;
    const newIndLevel = source.industrialLevel + gInd;

    if (gInd > 0) {
      const cleanSourceId = CountryRegistry.resolveCanonicalId(source.id);
      for (const [pid, prov] of Object.entries(updatedProvinces)) {
        if (
          CountryRegistry.resolveCanonicalId(prov.ownerNationId) ===
          cleanSourceId
        ) {
          let cap = prov.maxPopulationCapacity;
          let prod = prov.perCapitaProductivity;
          for (let i = 0; i < gInd; i++) {
            cap = DevelopmentManager.calculateNextCapacity(cap);
            prod = DevelopmentManager.calculateNextProductivity(prod);
          }
          updatedProvinces[pid] = {
            ...prov,
            maxPopulationCapacity: cap,
            perCapitaProductivity: prod,
          };
        }
      }
    }

    const updatedSource: Nation = {
      ...source,
      industrialLevel: newIndLevel,
      military: {
        ...source.military,
        techLevel: newTechLevel,
      },
    };

    const techTheftData: EspionageTechTheftData = {
      militaryTechGained: gMil,
      industrialLevelGained: gInd,
      totalPointsGained: pointsToGrant,
    };

    const message =
      outcome === "CLEAN_SUCCESS"
        ? `سرقت قرن با موفقیت انجام شد! دانشمندان شما موفق شدند ${pointsToGrant} سطح ارتقای فناوری از ${target.name} استخراج و اعمال کنند.`
        : `سرقت فناوری (${pointsToGrant} سطح ارتقا) موفق بود اما وزارت اطلاعات ${target.name} عاملان را شناسایی کرد (-۵۰ دیدگاه، -۱۵ اعتبار جهانی).`;

    return {
      updatedSource,
      updatedTarget: target,
      updatedProvinces,
      techTheftData,
      message,
    };
  }
}
