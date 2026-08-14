import { Nation } from "@/domain/nation/nation.schema";
import {
  EspionageOutcome,
  EspionageSabotageData,
} from "@/domain/espionage/espionage.schema";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export class SabotageTierExecutor {
  public static execute(
    target: Nation,
    isSuccess: boolean,
    outcome: EspionageOutcome,
  ): {
    updatedTarget: Nation;
    sabotageData?: EspionageSabotageData;
    message: string;
  } {
    if (!isSuccess) {
      return {
        updatedTarget: target,
        message: `تیم خرابکاری توسط گشت‌های ضدجاسوسی ${target.name} رهگیری و منهدم شد (-۳۵ دیدگاه، -۱۰ اعتبار جهانی).`,
      };
    }

    const destRatio = 0.2 + Math.random() * 0.1;
    const infLost = Math.floor((target.military.infantry || 0) * destRatio);
    const armLost = Math.floor((target.military.armor || 0) * destRatio);
    const adLost = Math.floor((target.military.airDefense || 0) * destRatio);
    const afLost = Math.floor((target.military.airForce || 0) * destRatio);
    const drLost = Math.floor((target.military.droneMissile || 0) * destRatio);
    const nvLost = Math.floor((target.military.navalFleet || 0) * destRatio);

    const updatedTargetMil = MilitaryInventoryHelper.applyCasualties(
      target.military,
      infLost,
      armLost,
      adLost,
      afLost,
      drLost,
      nvLost,
    );

    const stabDrain = 4;
    const updatedTarget: Nation = {
      ...target,
      military: updatedTargetMil,
      government: {
        ...target.government,
        stability: Math.max(0, target.government.stability - stabDrain),
      },
    };

    const sabotageData: EspionageSabotageData = {
      infantryDestroyed: infLost,
      armorDestroyed: armLost,
      airDefenseDestroyed: adLost,
      airForceDestroyed: afLost,
      droneMissileDestroyed: drLost,
      navalFleetDestroyed: nvLost,
      stabilityDrain: stabDrain,
    };

    const message =
      outcome === "CLEAN_SUCCESS"
        ? `عملیات خرابکاری در پایگاه‌های ${target.name} با انهدام موفق ادوات و پدافند به پایان رسید. هیچ ردی به جا نماند.`
        : `خرابکاری موفق بود و انبارهای تسلیحات ${target.name} منفجر شد، اما تیم نفوذی لو رفت (-۳۰ دیدگاه، -۵ اعتبار جهانی).`;

    return { updatedTarget, sabotageData, message };
  }
}
