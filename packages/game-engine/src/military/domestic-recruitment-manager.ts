import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { UnitType } from "@/domain/military/military.schema";
import { GameError, GovernmentTraitsUtility } from "@geopolitics/domain";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryQuotaCalculator } from "@/domain/military/military-quota-calculator.utility";
import { NationalProjectEffectApplierUtility } from "@/domain/projects/national-project-effect-applier.utility";

export class DomesticRecruitmentManager {
  public static executeRecruitment(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
    provincesMap?: Record<string, Province>,
  ): Nation {
    if (quantity <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "تعداد یگان درخواستی باید مثبت باشد.",
      );
    }

    const govModifiers = GovernmentTraitsUtility.getModifiers(
      nation.government?.type,
    );

    const projectDiscount =
      NationalProjectEffectApplierUtility.getCombinedDiscountMultiplier(
        nation.completedProjectIds,
        "procurementCostDiscountMultiplier",
      );

    const baseUnitPrice =
      MilitaryPricingCalculator.calculateUnitTypePrice(unitType);
    const unitPrice = Math.floor(
      baseUnitPrice * govModifiers.procurementCostMultiplier * projectDiscount,
    );
    const totalMoney = unitPrice * quantity;

    if (nation.treasury < totalMoney) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای ساخت یگان کافی نیست.",
      );
    }

    const gdp = getNationGdp(nation, provincesMap);
    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      gdp,
      nation.military,
    );
    const q = quotas[unitType];

    if (q.remainingRoom < quantity) {
      throw new GameError(
        "INVALID_ACTION",
        `سقف مجاز ساخت ${MILITARY_UNIT_STATS[unitType].nameFa} تکمیل شده است.`,
      );
    }

    const updatedMilitary = MilitaryInventoryHelper.addUnits(
      nation.military,
      unitType,
      quantity,
      nation.military.techLevel,
    );

    return {
      ...nation,
      treasury: nation.treasury - totalMoney,
      military: updatedMilitary,
    };
  }
}
