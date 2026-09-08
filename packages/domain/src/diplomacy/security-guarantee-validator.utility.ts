import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { CountryRegistry } from "@/domain/data/countries";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";
import { SecurityFeeCalculatorUtility } from "@/domain/diplomacy/security-fee-calculator.utility";

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
    provincesMap?: Record<string, Province>,
    isEmergency = false,
  ): SecurityGuaranteeValidationResult {
    const canonicalClient = CountryRegistry.resolveCanonicalId(client.id);
    const canonicalGuarantor = CountryRegistry.resolveCanonicalId(guarantor.id);

    if (canonicalClient === canonicalGuarantor) {
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

    if (isEmergency) {
      const clientTech = client.military.techLevel || 1.0;
      const guarantorTech = guarantor.military.techLevel || 1.0;
      const techDiff = Number((guarantorTech - clientTech).toFixed(1));

      const isGdpValid = gdpRatio >= 1.0;
      const isTechValid = techDiff > 0;
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
        hasSlotAvailable: true,
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
      reason = `پیمان دفاعی با کشور ${guarantor.name} در حال حاضر فعال است.`;
    } else if (!hasSlotAvailable) {
      reason = `سقف مجاز پیمان دفاعی تکمیل است (حداکثر ${this.MAX_DEFENSE_PACTS} کشور).`;
    } else if (!isNotWar) {
      reason =
        "امکان انعقاد پیمان دفاعی با کشور متخاصم در حال نبرد وجود ندارد.";
    } else if (!isGdpValid) {
      if (gdpRatio < this.MIN_DEFENSE_GDP_RATIO) {
        reason =
          "تولید ناخالص (GDP) کشور ضامن باید حداقل ۰.۷ برابر کشور شما باشد.";
      } else {
        reason =
          "تولید ناخالص (GDP) کشور ضامن نمی‌تواند بیش از ۵ برابر کشور شما باشد.";
      }
    } else if (!isReachable) {
      reason =
        "عدم دسترسی جغرافیایی یا دریایی برای برقراری ارتباط با این کشور.";
    } else if (!canAffordCost) {
      reason = "موجودی خزانه برای پرداخت هزینه ۱٪ از GDP کشور حامی کافی نیست.";
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
