import {
  Nation,
  MilitaryStack,
  ProvinceDynamicState,
  CountryRegistry,
  NationGettersUtility,
  getProvinceGdp,
  MilitaryDistributionEngine,
  MilitaryInventoryHelper,
  ALL_MILITARY_UNIT_TYPES,
  MapTopologyRegistry,
} from "@geopolitics/domain";

export class BreakthroughDefenseCalculator {
  public static getCandidateDefenderProvinces(
    defenderId: string,
    provincesMap?: Record<string, ProvinceDynamicState>,
    targetProvinceId?: number,
  ): ProvinceDynamicState[] {
    const canonicalDefender = CountryRegistry.resolveCanonicalId(defenderId);
    const owned = NationGettersUtility.getOwnedProvinces(
      canonicalDefender,
      provincesMap,
    );

    if (owned.length === 0) return [];

    let primary: ProvinceDynamicState | null = null;
    if (targetProvinceId) {
      const found = owned.find((p) => p.provinceId === targetProvinceId);
      if (found) primary = found;
    }

    const rest = owned.filter(
      (p) => !primary || p.provinceId !== primary.provinceId,
    );

    rest.sort((a, b) => {
      const gdpA = getProvinceGdp(a);
      const gdpB = getProvinceGdp(b);
      if (gdpB !== gdpA) return gdpB - gdpA;
      return (
        MapTopologyRegistry.getPixelCount(b.provinceId) -
        MapTopologyRegistry.getPixelCount(a.provinceId)
      );
    });

    return primary ? [primary, ...rest] : rest;
  }

  public static calculateProvinceGarrisonStack(
    province: ProvinceDynamicState,
    defenderDomesticTech = 1.0,
    defenderEquipmentTech = 1.0,
  ): MilitaryStack {
    const provGdp = getProvinceGdp(province, defenderEquipmentTech);
    return MilitaryDistributionEngine.calculateStartingStack(
      provGdp,
      defenderDomesticTech,
      defenderEquipmentTech,
    );
  }

  public static calculateTierDefenderStack(
    defender: Nation,
    tier: number,
    candidateProvinces: ProvinceDynamicState[],
  ): MilitaryStack {
    const baseMil = defender.military;
    const scaledInfantry = (baseMil.infantry || 0) * tier;
    const scaledArmor = (baseMil.armor || 0) * tier;
    const scaledAirDefense = (baseMil.airDefense || 0) * tier;
    const scaledAirForce = (baseMil.airForce || 0) * tier;
    const scaledDroneMissile = (baseMil.droneMissile || 0) * tier;

    let combinedStack: MilitaryStack = {
      infantry: scaledInfantry,
      armor: scaledArmor,
      airDefense: scaledAirDefense,
      airForce: scaledAirForce,
      droneMissile: scaledDroneMissile,
      techLevel: baseMil.techLevel,
      branchTech: baseMil.branchTech ? { ...baseMil.branchTech } : undefined,
    };

    const provincesForGarrison = candidateProvinces.slice(0, tier);
    for (let i = 0; i < provincesForGarrison.length; i++) {
      const prov = provincesForGarrison[i]!;
      const garrison = this.calculateProvinceGarrisonStack(
        prov,
        defender.military.techLevel,
        defender.equipmentTechLevel,
      );

      for (const unitType of ALL_MILITARY_UNIT_TYPES) {
        const count = MilitaryInventoryHelper.getUnitCount(garrison, unitType);
        if (count > 0) {
          const tech = MilitaryInventoryHelper.getBranchTech(
            garrison,
            unitType,
          );
          combinedStack = MilitaryInventoryHelper.addUnits(
            combinedStack,
            unitType,
            count,
            tech,
          );
        }
      }
    }

    return combinedStack;
  }
}
