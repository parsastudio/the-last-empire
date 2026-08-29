import {
  Nation,
  Province,
  MilitaryStack,
  MilitaryInventoryHelper,
  MilitaryPricingCalculator,
  getNationGdp,
  UnitType,
} from "@geopolitics/domain";
import { MilitaryPayrollCalculator } from "@geopolitics/game-engine";
import { DEFAULT_NATION_MOCK } from "@/domain/nation/default-nation.mock";
import { CountryRegistry } from "@/domain/data/countries";

export interface MilitaryUnitItemViewModel {
  type: UnitType;
  nameFa: string;
  count: number;
  payrollCost: number;
  techLevel: number;
}

export interface MilitaryForcesViewModel {
  units: MilitaryUnitItemViewModel[];
  techLevel: number;
  experience: number;
}

export interface MilitaryValuationViewModel {
  totalValuation: number;
  totalUnits: number;
  totalPayroll: number;
  isGdpCapped: boolean;
  capacityRatio: number;
}

export function selectMilitaryForcesViewModel(
  nation: Nation | null | undefined,
  provincesMap?: Record<string, Province>,
): MilitaryForcesViewModel {
  const activeNation: Nation = nation || {
    ...DEFAULT_NATION_MOCK,
    military: {
      infantry: 0,
      armor: 0,
      airDefense: 0,
      airForce: 0,
      droneMissile: 0,
      experience: 0,
      techLevel: 1.0,
      branchTech: MilitaryInventoryHelper.initializeBranchTech(1.0),
    },
  };

  const payroll = MilitaryPayrollCalculator.calculatePayroll(
    activeNation,
    provincesMap,
  );

  const units: MilitaryUnitItemViewModel[] = [
    {
      type: "INFANTRY",
      nameFa: "پیاده‌نظام",
      count: activeNation.military.infantry || 0,
      payrollCost: payroll.infantry,
      techLevel: MilitaryInventoryHelper.getBranchTech(
        activeNation.military,
        "INFANTRY",
      ),
    },
    {
      type: "ARMOR",
      nameFa: "زرهی و تانک",
      count: activeNation.military.armor || 0,
      payrollCost: payroll.armor,
      techLevel: MilitaryInventoryHelper.getBranchTech(
        activeNation.military,
        "ARMOR",
      ),
    },
    {
      type: "AIR_DEFENSE",
      nameFa: "پدافند هوایی",
      count: activeNation.military.airDefense || 0,
      payrollCost: payroll.airDefense,
      techLevel: MilitaryInventoryHelper.getBranchTech(
        activeNation.military,
        "AIR_DEFENSE",
      ),
    },
    {
      type: "AIR_FORCE",
      nameFa: "نیروی هوایی",
      count: activeNation.military.airForce || 0,
      payrollCost: payroll.airForce,
      techLevel: MilitaryInventoryHelper.getBranchTech(
        activeNation.military,
        "AIR_FORCE",
      ),
    },
    {
      type: "DRONE_MISSILE",
      nameFa: "پهپاد و موشک",
      count: activeNation.military.droneMissile || 0,
      payrollCost: payroll.droneMissile,
      techLevel: MilitaryInventoryHelper.getBranchTech(
        activeNation.military,
        "DRONE_MISSILE",
      ),
    },
  ];

  return {
    units,
    techLevel: activeNation.military.techLevel,
    experience: activeNation.military.experience,
  };
}

export function selectMilitaryValuationViewModel(
  military: MilitaryStack,
  industrialLevel = 1,
  nationId = "IRN",
  nation?: Nation | null,
  provincesMap?: Record<string, Province>,
): MilitaryValuationViewModel {
  const totalValuation =
    MilitaryPricingCalculator.calculateTotalArmyValuation(military);

  const totalUnits =
    (military.infantry || 0) +
    (military.armor || 0) +
    (military.airDefense || 0) +
    (military.airForce || 0) +
    (military.droneMissile || 0);

  const activeNation: Nation = nation || {
    ...DEFAULT_NATION_MOCK,
    id: CountryRegistry.resolveCanonicalId(nationId),
    industrialLevel,
    military,
  };

  const payroll = MilitaryPayrollCalculator.calculatePayroll(
    activeNation,
    provincesMap,
  );
  const gdp = getNationGdp(activeNation, provincesMap);
  const capacityRatio =
    gdp > 0 ? Math.min(100, Math.round((totalValuation / gdp) * 100)) : 100;

  return {
    totalValuation,
    totalUnits,
    totalPayroll: payroll.total,
    isGdpCapped: payroll.gdpCapped,
    capacityRatio,
  };
}
