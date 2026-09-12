import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";
import { SecurityFeeCalculatorUtility } from "@/domain/diplomacy/security-fee-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { AppLocale } from "@/domain/shared/locale-number-formatter";

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
  hasSlotAvailable: boolean;
  canAffordCost: boolean;
  isEmergencyProtectorate?: boolean;
}

export class SecurityGuaranteeValidator {
  public static readonly MAX_DEFENSE_PACTS = 2;
  public static readonly MIN_DEFENSE_GDP_RATIO = 0.7;
  public static readonly MAX_DEFENSE_GDP_RATIO = 5.0;

  public static validate(
    client: Nation,
    guarantor: Nation,
    provincesMap?: Record<string, ProvinceDynamicState>,
    isEmergency = false,
    allNations?: Record<string, Nation>,
    rankMap?: Map<string, number>,
    locale: AppLocale = "fa",
  ): SecurityGuaranteeValidationResult {
    const canonicalClient = CountryRegistry.resolveCanonicalId(client.id);
    const canonicalGuarantor = CountryRegistry.resolveCanonicalId(guarantor.id);

    if (canonicalClient === canonicalGuarantor) {
      return {
        isValid: false,
        reason:
          locale === "en"
            ? "Cannot select your own nation as defense guarantor."
            : "امکان انتخاب کشور خود به عنوان ضامن وجود ندارد.",
        gdpRatio: 1,
        techDiff: 0,
        tension: 0,
        isGdpValid: false,
        isTechValid: false,
        isTensionValid: true,
        isNotWar: true,
        hasSlotAvailable: false,
        canAffordCost: false,
        isEmergencyProtectorate: isEmergency,
      };
    }

    const clientGdp = getNationGdp(client, provincesMap);
    const guarantorGdp = getNationGdp(guarantor, provincesMap);
    const gdpRatio = Number((guarantorGdp / Math.max(1, clientGdp)).toFixed(2));

    const rel = NationRelationResolver.getRelation(
      client.relations,
      canonicalGuarantor,
    );
    const tension = rel ? (rel.tension ?? 10) : 10;
    const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
    const isNotWar = stance !== "WAR";

    if (client.isAi && allNations) {
      const aliveCount = Object.values(allNations).filter(
        (n) => n.isAlive,
      ).length;
      const top20Threshold = Math.ceil(aliveCount * 0.2);
      const clientRank =
        rankMap?.get(canonicalClient) ??
        rankMap?.get(client.id) ??
        NationGettersUtility.getRank(client.id, allNations, provincesMap);

      if (clientRank <= top20Threshold) {
        return {
          isValid: false,
          reason:
            locale === "en"
              ? "Top 20% AI superpowers cannot enter subordinate defense pacts."
              : "کشورهای هوش مصنوعی در ۲۰٪ برتر مجاز به انعقاد پیمان دفاعی نیستند.",
          gdpRatio,
          techDiff: 0,
          tension,
          isGdpValid: false,
          isTechValid: false,
          isTensionValid: true,
          isNotWar,
          hasSlotAvailable: false,
          canAffordCost: false,
          isEmergencyProtectorate: isEmergency,
        };
      }
    }

    if (isEmergency) {
      const clientTech = client.military.techLevel || 1.0;
      const guarantorTech = guarantor.military.techLevel || 1.0;
      const techDiff = Number((guarantorTech - clientTech).toFixed(1));

      const isAlreadyUnderOtherProtectorate =
        Boolean(client.securityGuarantorId) &&
        Boolean(client.isEmergencyProtectorate) &&
        CountryRegistry.resolveCanonicalId(client.securityGuarantorId) !==
          canonicalGuarantor;

      const isGdpValid = gdpRatio >= 1.0;
      const isTechValid = techDiff > 0;
      const isTensionValid = tension < 50;

      let reason: string | undefined = undefined;
      if (!isNotWar) {
        reason =
          locale === "en"
            ? "Cannot request a protectorate from an active wartime adversary."
            : "نمی‌توان از کشوری که با آن در حال جنگ هستید درخواست تحت‌الحمایگی کرد.";
      } else if (isAlreadyUnderOtherProtectorate) {
        reason =
          locale === "en"
            ? "Your realm is currently under another protectorate; revoke it first."
            : "کشور شما در حال حاضر تحت‌الحمایه کشور دیگری است. ابتدا باید معاهده قبلی را لغو کنید.";
      } else if (!isTensionValid) {
        reason =
          locale === "en"
            ? "Bilateral tension with guarantor must remain below 50%."
            : "تنش با ابرقدرت حامی باید کمتر از ۵۰٪ باشد.";
      } else if (!isGdpValid) {
        reason =
          locale === "en"
            ? "Guarantor GDP must be at least equal to your national output."
            : "GDP ابرقدرت حامی باید حداقل برابر با کشور شما باشد.";
      } else if (!isTechValid) {
        reason =
          locale === "en"
            ? "Guarantor military tech level must strictly exceed your level."
            : "سطح فناوری نظامی ابرقدرت حامی باید بالاتر از شما باشد.";
      }

      const isValid =
        isGdpValid &&
        isTechValid &&
        isNotWar &&
        isTensionValid &&
        !isAlreadyUnderOtherProtectorate;

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
        hasSlotAvailable: !isAlreadyUnderOtherProtectorate,
        canAffordCost: true,
        isEmergencyProtectorate: true,
      };
    }

    const existingGuarantors = client.defenseGuarantorIds || [];
    const isAlreadyGuarantor = existingGuarantors.includes(canonicalGuarantor);
    const hasSlotAvailable =
      existingGuarantors.length < this.MAX_DEFENSE_PACTS && !isAlreadyGuarantor;

    const isGdpValid =
      gdpRatio >= this.MIN_DEFENSE_GDP_RATIO &&
      gdpRatio <= this.MAX_DEFENSE_GDP_RATIO;

    const signingCost =
      SecurityFeeCalculatorUtility.calculateSigningCost(guarantorGdp);
    const canAffordCost = client.treasury >= signingCost;

    const proximity = GeopoliticalReachResolver.getProximityTier(
      client,
      guarantor,
      provincesMap,
    );
    const isReachable = proximity !== "NONE";

    let reason: string | undefined = undefined;
    if (isAlreadyGuarantor) {
      reason =
        locale === "en"
          ? `Defense pact with ${guarantor.name} is already active.`
          : `پیمان دفاعی با کشور ${guarantor.name} در حال حاضر فعال است.`;
    } else if (!hasSlotAvailable) {
      reason =
        locale === "en"
          ? `Defense pact quota exhausted (max ${this.MAX_DEFENSE_PACTS}).`
          : `سقف مجاز پیمان دفاعی تکمیل است (حداکثر ${this.MAX_DEFENSE_PACTS} کشور).`;
    } else if (!isNotWar) {
      reason =
        locale === "en"
          ? "Cannot ratify a defense pact with an active enemy."
          : "امکان انعقاد پیمان دفاعی با کشور متخاصم در حال نبرد وجود ندارد.";
    } else if (!isGdpValid) {
      if (gdpRatio < this.MIN_DEFENSE_GDP_RATIO) {
        reason =
          locale === "en"
            ? "Guarantor GDP must be at least 0.7x of your national output."
            : "تولید ناخالص (GDP) کشور ضامن باید حداقل ۰.۷ برابر کشور شما باشد.";
      } else {
        reason =
          locale === "en"
            ? "Guarantor GDP cannot exceed 5.0x of your national output."
            : "تولید ناخالص (GDP) کشور ضامن نمی‌تواند بیش از ۵ برابر کشور شما باشد.";
      }
    } else if (!isReachable) {
      reason =
        locale === "en"
          ? "No geographic or maritime connectivity to reach this realm."
          : "عدم دسترسی جغرافیایی یا دریایی برای برقراری ارتباط با این کشور.";
    } else if (!canAffordCost) {
      reason =
        locale === "en"
          ? "Insufficient treasury reserves to cover the 1% GDP retainer fee."
          : "موجودی خزانه برای پرداخت هزینه ۱٪ از GDP کشور حامی کافی نیست.";
    }

    const isValid =
      hasSlotAvailable &&
      isNotWar &&
      isGdpValid &&
      isReachable &&
      canAffordCost;

    return {
      isValid,
      reason,
      gdpRatio,
      techDiff: 0,
      tension,
      isGdpValid,
      isTechValid: true,
      isTensionValid: true,
      isNotWar,
      hasSlotAvailable,
      canAffordCost,
      isEmergencyProtectorate: false,
    };
  }
}
