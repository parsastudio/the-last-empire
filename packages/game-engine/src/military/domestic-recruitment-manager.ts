import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { UnitType } from "@/domain/military/military.schema";
import { GameError } from "@geopolitics/domain";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
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
      throw new GameError("INVALID_QUANTITY");
    }

    const projectDiscount =
      NationalProjectEffectApplierUtility.getProcurementDiscountMultiplier(
        nation,
      );

    const baseUnitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
      unitType,
      nation.government?.type,
    );
    const unitPrice = Math.floor(baseUnitPrice * projectDiscount);
    const totalMoney = unitPrice * quantity;

    if (nation.treasury < totalMoney) {
      throw new GameError("INSUFFICIENT_FUNDS");
    }

    const gdp = getNationGdp(nation, provincesMap);
    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      gdp,
      nation.military,
    );
    const q = quotas[unitType];

    if (q.remainingRoom < quantity) {
      throw new GameError("QUOTA_REACHED");
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
