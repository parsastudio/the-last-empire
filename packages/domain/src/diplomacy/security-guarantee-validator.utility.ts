import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";

export interface SecurityGuaranteeValidationResult {
  isValid: boolean;
  reason?: string;
  gdpRatio: number;
  techDiff: number;
  tension: number;
  isGdpValid: boolean;
  isTechValid: boolean;
  isTensionValid: boolean;
  isNotWar: boolean;
}

export class SecurityGuaranteeValidator {
  public static validate(
    client: Nation,
    guarantor: Nation,
    provincesMap?: Record<string, Province>,
  ): SecurityGuaranteeValidationResult {
    if (client.id === guarantor.id) {
      return {
        isValid: false,
        reason: "امکان انتخاب کشور خود به عنوان ضامن وجود ندارد.",
        gdpRatio: 1,
        techDiff: 0,
        tension: 0,
        isGdpValid: false,
        isTechValid: false,
        isTensionValid: true,
        isNotWar: true,
      };
    }

    const clientGdp = getNationGdp(client, provincesMap);
    const guarantorGdp = getNationGdp(guarantor, provincesMap);
    const gdpRatio = Number((guarantorGdp / Math.max(1, clientGdp)).toFixed(2));

    const isGdpValid = gdpRatio >= 2.0 && gdpRatio <= 10.0;

    const clientTech = client.military.techLevel || 1.0;
    const guarantorTech = guarantor.military.techLevel || 1.0;
    const techDiff = Number((guarantorTech - clientTech).toFixed(1));
    const isTechValid = techDiff >= 1.0;

    const rel = NationRelationResolver.getRelation(
      client.relations,
      guarantor.id,
    );
    const tension = rel ? (rel.tension ?? 10) : 10;
    const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";

    const isNotWar = stance !== "WAR";
    const isTensionValid = tension < 35;

    let reason: string | undefined = undefined;
    if (!isNotWar) {
      reason = "در وضعیت جنگ امکان انعقاد پیمان امنیتی وجود ندارد.";
    } else if (!isTensionValid) {
      reason = "تنش دیپلماتیک باید کمتر از ۳۵٪ باشد.";
    } else if (!isGdpValid) {
      if (gdpRatio < 2.0) {
        reason = "GDP کشور ضامن باید حداقل ۲ برابر کشور شما باشد.";
      } else {
        reason = "GDP کشور ضامن نباید بیش از ۱۰ برابر کشور شما باشد.";
      }
    } else if (!isTechValid) {
      reason = "سطح فناوری نظامی ضامن باید حداقل ۱.۰ لول بالاتر باشد.";
    }

    const isValid = isGdpValid && isTechValid && isNotWar && isTensionValid;

    return {
      isValid,
      reason,
      gdpRatio,
      techDiff,
      tension,
      isGdpValid,
      isTechValid,
      isTensionValid,
      isNotWar,
    };
  }
}
