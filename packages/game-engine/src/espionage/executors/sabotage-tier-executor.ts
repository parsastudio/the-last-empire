import { Nation } from "@/domain/nation/nation.schema";
import {
  EspionageOutcome,
  EspionageSabotageData,
} from "@/domain/espionage/espionage.schema";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { SeededRandom } from "@/domain/shared/domain-utilities";

export class SabotageTierExecutor {
  public static execute(
    target: Nation,
    isSuccess: boolean,
    _outcome: EspionageOutcome,
    prng?: SeededRandom,
  ): {
    updatedTarget: Nation;
    sabotageData?: EspionageSabotageData;
    message: string;
  } {
    if (!isSuccess) {
      return {
        updatedTarget: target,
        message: `عملیات خرابکاری توسط ضدجاسوسی ${target.name} خنثی شد و هویت تیم نفوذی لو رفت (-۵۰ همسویی، -۷ اعتبار جهانی).`,
      };
    }

    const randomFactor = prng ? prng.nextFloat() : 0.5;
    const destRatio = 0.2 + randomFactor * 0.1;
    const infLost = Math.floor((target.military.infantry || 0) * destRatio);
    const armLost = Math.floor((target.military.armor || 0) * destRatio);
    const adLost = Math.floor((target.military.airDefense || 0) * destRatio);
    const afLost = Math.floor((target.military.airForce || 0) * destRatio);
    const drLost = Math.floor((target.military.droneMissile || 0) * destRatio);

    const updatedTargetMil = MilitaryInventoryHelper.applyCasualties(
      target.military,
      infLost,
      armLost,
      adLost,
      afLost,
      drLost,
    );

    const updatedTarget: Nation = {
      ...target,
      military: updatedTargetMil,
    };

    const sabotageData: EspionageSabotageData = {
      infantryDestroyed: infLost,
      armorDestroyed: armLost,
      airDefenseDestroyed: adLost,
      airForceDestroyed: afLost,
      droneMissileDestroyed: drLost,
    };

    const message = `عملیات خرابکاری در پایگاه‌های ${target.name} با انهدام موفق ادوات و پدافند به پایان رسید. هیچ ردی به جا نماند.`;

    return { updatedTarget, sabotageData, message };
  }
}
