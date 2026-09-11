import {
  Nation,
  Province,
  MilitaryStack,
  MilitaryInventoryHelper,
  MilitaryPricingCalculator,
  getNationGdp,
  UnitType,
  DEFAULT_NATION_MOCK,
  CountryRegistry,
  MilitaryPayrollCalculator,
} from "@geopolitics/domain";

export interface MilitaryUnitItemViewModel {
  type: UnitType;
  count: number;
  payrollCost: number;
  techLevel: number;
}

export interface MilitaryForcesViewModel {
  units: MilitaryUnitItemViewModel[];
  techLevel: number;
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
      count: activeNation.military.infantry || 0,
      payrollCost: payroll.infantry,
      techLevel: MilitaryInventoryHelper.getBranchTech(
        activeNation.military,
        "INFANTRY",
      ),
    },
    {
      type: "ARMOR",
      count: activeNation.military.armor || 0,
      payrollCost: payroll.armor,
      techLevel: MilitaryInventoryHelper.getBranchTech(
        activeNation.military,
        "ARMOR",
      ),
    },
    {
      type: "AIR_DEFENSE",
      count: activeNation.military.airDefense || 0,
      payrollCost: payroll.airDefense,
      techLevel: MilitaryInventoryHelper.getBranchTech(
        activeNation.military,
        "AIR_DEFENSE",
      ),
    },
    {
      type: "AIR_FORCE",
      count: activeNation.military.airForce || 0,
      payrollCost: payroll.airForce,
      techLevel: MilitaryInventoryHelper.getBranchTech(
        activeNation.military,
        "AIR_FORCE",
      ),
    },
    {
      type: "DRONE_MISSILE",
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
  };
}

export function selectMilitaryValuationViewModel(
  military: MilitaryStack,
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
    military,
  };

  const payroll = MilitaryPayrollCalculator.calculatePayroll(
    activeNation,
    provincesMap,
  );
  const gdp = getNationGdp(activeNation, provincesMap);
  const capacityRatio = MilitaryPricingCalculator.calculateArmyCapacityRatio(
    gdp,
    totalValuation,
  );

  return {
    totalValuation,
    totalUnits,
    totalPayroll: payroll.total,
    isGdpCapped: payroll.gdpCapped,
    capacityRatio,
  };
}
