import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import {
  EspionageOutcome,
  EspionageTechTheftData,
} from "@/domain/espionage/espionage.schema";
import { TechSuperiorityDelta } from "@/engine/espionage/espionage-calculator";
import { DevelopmentManager } from "@/engine/economy/calculators/infrastructure-manager";
import { CountryRegistry } from "@/domain/data/countries";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

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
        message: `نفوذ به سرورهای محرمانه ${target.name} شکست خورد و کدهای نفوذی مسدود شدند (-۱۰ اعتبار جهانی).`,
      };
    }

    const indDiff = superiority.industrialDelta;
    const milDiff = superiority.militaryDelta;

    let gInd = 0;
    let gMil = 0;

    if (indDiff > 0 && milDiff > 0) {
      gInd = Math.min(1, indDiff);
      gMil = Number(Math.min(0.5, milDiff).toFixed(1));
    } else if (indDiff > 0 && milDiff === 0) {
      gInd = Math.min(2, indDiff);
      gMil = 0;
    } else if (milDiff > 0 && indDiff === 0) {
      gInd = 0;
      gMil = Number(Math.min(1.0, milDiff).toFixed(1));
    }

    const newTechLevel = Number((source.military.techLevel + gMil).toFixed(1));
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

    const updatedMilitary =
      gMil > 0
        ? MilitaryInventoryHelper.syncBranchTechOnUpgrade(
            source.military,
            newTechLevel,
          )
        : source.military;

    const updatedSource: Nation = {
      ...source,
      industrialLevel: newIndLevel,
      military: updatedMilitary,
    };

    const techTheftData: EspionageTechTheftData = {
      militaryTechGained: gMil,
      industrialLevelGained: gInd,
      totalPointsGained: Number((gMil + gInd).toFixed(1)),
    };

    const gainParts: string[] = [];
    if (gInd > 0) gainParts.push(`${gInd} سطح توسعه صنعتی`);
    if (gMil > 0) gainParts.push(`${gMil} سطح فناوری نظامی`);
    const gainDescription = gainParts.join(" و ");

    const message =
      outcome === "CLEAN_SUCCESS"
        ? `سرقت فناوری با موفقیت انجام شد! دانشمندان شما موفق شدند ${gainDescription} از کشور ${target.name} استخراج و اعمال کنند.`
        : `سرقت فناوری (${gainDescription}) موفق بود اما سازمان اطلاعات ${target.name} منشأ نفوذ را شناسایی کرد (-۲۵ همسویی هدف، -۱۰ اعتبار جهانی).`;

    return {
      updatedSource,
      updatedTarget: target,
      updatedProvinces,
      techTheftData,
      message,
    };
  }
}
