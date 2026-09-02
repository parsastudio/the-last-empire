import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

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
  isEmergencyProtectorate?: boolean;
}

export class SecurityGuaranteeValidator {
  public static readonly TOP_TIER_PERCENTILE = 0.4;

  public static validate(
    client: Nation,
    guarantor: Nation,
    provincesMap?: Record<string, Province>,
    isEmergency = false,
    allNations?: Record<string, Nation>,
    rankMap?: Map<string, number>,
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
        isEmergencyProtectorate: isEmergency,
      };
    }

    const clientGdp = getNationGdp(client, provincesMap);
    const guarantorGdp = getNationGdp(guarantor, provincesMap);
    const gdpRatio = Number((guarantorGdp / Math.max(1, clientGdp)).toFixed(2));

    const clientTech = client.military.techLevel || 1.0;
    const guarantorTech = guarantor.military.techLevel || 1.0;
    const techDiff = Number((guarantorTech - clientTech).toFixed(1));
    const isTechValid = techDiff > 0;

    const rel = NationRelationResolver.getRelation(
      client.relations,
      guarantor.id,
    );
    const tension = rel ? (rel.tension ?? 10) : 10;
    const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
    const isNotWar = stance !== "WAR";

    if (allNations && client.isAi) {
      const aliveNations = Object.values(allNations).filter((n) => n.isAlive);
      const aliveCount = Math.max(1, aliveNations.length);
      const topTierCutoff = Math.max(
        1,
        Math.ceil(aliveCount * this.TOP_TIER_PERCENTILE),
      );
      const canonicalClient = CountryRegistry.resolveCanonicalId(client.id);
      const clientRank =
        rankMap?.get(canonicalClient) ??
        NationGettersUtility.getRank(
          client.id,
          allNations,
          provincesMap,
          rankMap,
        );

      if (clientRank <= topTierCutoff) {
        return {
          isValid: false,
          reason:
            "کشورهای حاضر در ۴۰٪ قدرت برتر جهان مجاز به پذیرش چتر امنیتی نیستند.",
          gdpRatio,
          techDiff,
          tension,
          isGdpValid: false,
          isTechValid,
          isTensionValid: true,
          isNotWar,
          isEmergencyProtectorate: isEmergency,
        };
      }
    }

    if (isEmergency) {
      const isGdpValid = gdpRatio >= 1.0;
      const isTensionValid = tension < 50;

      let reason: string | undefined = undefined;
      if (!isNotWar) {
        reason =
          "نمی‌توان از کشوری که با آن در حال جنگ هستید درخواست تحت‌الحمایگی کرد.";
      } else if (!isTensionValid) {
        reason = "تنش با ابرقدرت حامی باید کمتر از ۵۰٪ باشد.";
      } else if (!isGdpValid) {
        reason = "GDP ابرقدرت حامی باید حداقل برابر کشور شما باشد.";
      } else if (!isTechValid) {
        reason = "سطح فناوری نظامی ابرقدرت حامی باید بالاتر از شما باشد.";
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
        isEmergencyProtectorate: true,
      };
    }

    const isGdpValid = gdpRatio >= 1.0 && gdpRatio <= 10.0;
    const isTensionValid = tension < 35;

    let reason: string | undefined = undefined;
    if (!isNotWar) {
      reason =
        "در وضعیت جنگ امکان انعقاد پیمان امنیتی عادی وجود ندارد (از پیمان تحت‌الحمایگی اضطراری استفاده کنید).";
    } else if (!isTensionValid) {
      reason = "تنش دیپلماتیک باید کمتر از ۳۵٪ باشد.";
    } else if (!isGdpValid) {
      if (gdpRatio < 1.0) {
        reason = "GDP کشور ضامن باید حداقل برابر کشور شما باشد.";
      } else {
        reason = "GDP کشور ضامن نباید بیش از ۱۰ برابر کشور شما باشد.";
      }
    } else if (!isTechValid) {
      reason = "سطح فناوری نظامی کشور ضامن باید بالاتر از شما باشد.";
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
      isEmergencyProtectorate: false,
    };
  }
}
