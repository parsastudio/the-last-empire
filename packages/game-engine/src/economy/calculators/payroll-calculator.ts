import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";

export interface BreakdownMilitaryPayroll {
  infantry: number;
  armor: number;
  airDefense: number;
  airForce: number;
  droneMissile: number;
  total: number;
  rawTotal: number;
  gdpCapped: boolean;
}

export class MilitaryPayrollCalculator {
  public static readonly PAYROLL_RATE = 0.06;

  public static calculatePayroll(
    nation: Nation,
    provincesMap?: Record<string, Province>,
  ): BreakdownMilitaryPayroll {
    const rawInfantry = Math.floor(
      MilitaryPricingCalculator.calculateUnitValuation(
        "INFANTRY",
        nation.military.infantry || 0,
      ) * this.PAYROLL_RATE,
    );
    const rawArmor = Math.floor(
      MilitaryPricingCalculator.calculateUnitValuation(
        "ARMOR",
        nation.military.armor || 0,
      ) * this.PAYROLL_RATE,
    );
    const rawAirDefense = Math.floor(
      MilitaryPricingCalculator.calculateUnitValuation(
        "AIR_DEFENSE",
        nation.military.airDefense || 0,
      ) * this.PAYROLL_RATE,
    );
    const rawAirForce = Math.floor(
      MilitaryPricingCalculator.calculateUnitValuation(
        "AIR_FORCE",
        nation.military.airForce || 0,
      ) * this.PAYROLL_RATE,
    );
    const rawDroneMissile = Math.floor(
      MilitaryPricingCalculator.calculateUnitValuation(
        "DRONE_MISSILE",
        nation.military.droneMissile || 0,
      ) * this.PAYROLL_RATE,
    );

    const rawTotal =
      rawInfantry + rawArmor + rawAirDefense + rawAirForce + rawDroneMissile;

    const gdp = getNationGdp(nation, provincesMap);
    const maxAllowedPayroll = gdp > 0 ? Math.floor(gdp * 0.06) : rawTotal;

    if (rawTotal > maxAllowedPayroll && rawTotal > 0) {
      const scale = maxAllowedPayroll / rawTotal;
      const infantry = Math.floor(rawInfantry * scale);
      const armor = Math.floor(rawArmor * scale);
      const airDefense = Math.floor(rawAirDefense * scale);
      const airForce = Math.floor(rawAirForce * scale);
      const droneMissile = Math.floor(rawDroneMissile * scale);
      const total = infantry + armor + airDefense + airForce + droneMissile;

      return {
        infantry,
        armor,
        airDefense,
        airForce,
        droneMissile,
        total,
        rawTotal,
        gdpCapped: true,
      };
    }

    return {
      infantry: rawInfantry,
      armor: rawArmor,
      airDefense: rawAirDefense,
      airForce: rawAirForce,
      droneMissile: rawDroneMissile,
      total: rawTotal,
      rawTotal,
      gdpCapped: false,
    };
  }
}
