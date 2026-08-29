import { CountryRegistry } from "@/domain/data/countries";
import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";
import { MilitaryDistributionEngine } from "@/domain/military/military-distribution-engine";
import { MilitaryStack } from "@/domain/military/military.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";

export interface NationRankCandidateInput {
  id: string;
  name?: string;
  gdp: number;
  population?: number;
  military?: MilitaryStack;
  governmentType?: GovernmentType | string;
  domesticTechLevel?: number;
  equipmentTechLevel?: number;
  startingTechLevel?: number;
  militaryTier?: number;
  hasSeaAccess?: boolean;
  navalFleet?: number;
  stability?: number;
  globalReputation?: number;
}

interface RankedCandidate {
  id: string;
  canonicalId: string;
  powerScore: number;
  gdp: number;
}

export class NationGettersUtility {
  public static calculateRankMapFromCandidates(
    candidatesInput: NationRankCandidateInput[],
  ): Map<string, number> {
    const rankMap = new Map<string, number>();
    const count = candidatesInput.length;
    if (count === 0) return rankMap;

    const rankedList: RankedCandidate[] = new Array(count);

    for (let i = 0; i < count; i++) {
      const input = candidatesInput[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(input.id);
      const profile = CountryRegistry.getCountry(canonicalId);

      const domesticTech =
        input.military?.techLevel ??
        input.domesticTechLevel ??
        input.startingTechLevel ??
        profile?.domesticTechLevel ??
        profile?.startingTechLevel ??
        1.0;

      const equipmentTech =
        input.equipmentTechLevel ?? profile?.equipmentTechLevel ?? domesticTech;

      let activeCombatPower = 0;

      if (input.military) {
        activeCombatPower = MilitaryPowerCalculator.calculateEffectivePower({
          id: canonicalId,
          name: input.name || profile?.nameFa || canonicalId,
          isAi: true,
          isAlive: true,
          flagCode: profile?.flagCode || "IR",
          economicStance: "BALANCED_MIXED",
          treasury: 100000,
          nationalDebt: 0,
          industrialLevel: 1,
          navalFleet: input.navalFleet ?? 0,
          government: {
            type:
              (input.governmentType as GovernmentType) ||
              profile?.startingGovernment ||
              "DEMOCRACY",
            stability: input.stability ?? 50,
            turnsInPower: 1,
          },
          military: input.military,
          recruitmentQueue: [],
          relations: {},
          activeModifiers: [],
          globalReputation: input.globalReputation ?? 50,
          executedEspionageTiers: [],
          attackedTargetIdsThisTurn: [],
          warFocusTargetId: null,
          postWarCooldownTurns: 0,
          doctrine: "DOMESTIC_INDUSTRIALIST",
          securityGuarantorId: null,
        });
      } else {
        const stack = MilitaryDistributionEngine.calculateStartingStack(
          input.gdp,
          domesticTech,
          equipmentTech,
        );
        activeCombatPower = MilitaryPowerCalculator.calculateEffectivePower({
          id: canonicalId,
          name: input.name || profile?.nameFa || canonicalId,
          isAi: true,
          isAlive: true,
          flagCode: profile?.flagCode || "IR",
          economicStance: "BALANCED_MIXED",
          treasury: 100000,
          nationalDebt: 0,
          industrialLevel: 1,
          navalFleet: input.navalFleet ?? 0,
          government: {
            type:
              (input.governmentType as GovernmentType) ||
              profile?.startingGovernment ||
              "DEMOCRACY",
            stability: input.stability ?? 50,
            turnsInPower: 1,
          },
          military: stack,
          recruitmentQueue: [],
          relations: {},
          activeModifiers: [],
          globalReputation: input.globalReputation ?? 50,
          executedEspionageTiers: [],
          attackedTargetIdsThisTurn: [],
          warFocusTargetId: null,
          postWarCooldownTurns: 0,
          doctrine: "DOMESTIC_INDUSTRIALIST",
          securityGuarantorId: null,
        });
      }

      const effectiveFieldTech = Math.max(domesticTech, equipmentTech);
      const techMultiplier = 1 + (Math.max(1, effectiveFieldTech) - 1) * 0.5;

      const navalPower = (input.navalFleet ?? 0) * 1500 * techMultiplier;
      const totalBattlefieldPower = activeCombatPower + navalPower;

      const economicWarPotential = (input.gdp / 1_000_000_000) * techMultiplier;

      const stabilityFactor = 0.8 + 0.2 * ((input.stability ?? 50) / 100);
      const repBonus = 1 + (((input.globalReputation ?? 50) - 50) / 50) * 0.05;
      const resilienceMultiplier = stabilityFactor * repBonus;

      const powerScore =
        (totalBattlefieldPower * 0.6 + economicWarPotential * 0.4) *
        resilienceMultiplier;

      rankedList[i] = {
        id: input.id,
        canonicalId,
        powerScore,
        gdp: input.gdp,
      };
    }

    rankedList.sort((a, b) => {
      if (b.powerScore !== a.powerScore) {
        return b.powerScore - a.powerScore;
      }
      if (b.gdp !== a.gdp) {
        return b.gdp - a.gdp;
      }
      return a.canonicalId.localeCompare(b.canonicalId);
    });

    for (let i = 0; i < count; i++) {
      const item = rankedList[i]!;
      const rankValue = i + 1;
      rankMap.set(item.canonicalId, rankValue);
      rankMap.set(item.id, rankValue);
    }

    return rankMap;
  }

  public static buildProvincesByOwnerMap(
    provincesMap?: Record<string, Province> | Province[],
  ): Map<string, Province[]> {
    const map = new Map<string, Province[]>();
    if (!provincesMap) return map;

    const list = Array.isArray(provincesMap)
      ? provincesMap
      : Object.values(provincesMap);

    for (let i = 0; i < list.length; i++) {
      const p = list[i]!;
      const cid = CountryRegistry.resolveCanonicalId(p.ownerNationId);
      let group = map.get(cid);
      if (!group) {
        group = [];
        map.set(cid, group);
      }
      group.push(p);
    }

    return map;
  }

  public static getOwnedProvinces(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): Province[] {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    if (provincesByOwnerMap) {
      return (
        provincesByOwnerMap.get(canonicalId) ??
        provincesByOwnerMap.get(nationId) ??
        []
      );
    }
    if (!provincesMap) return [];
    const list = Array.isArray(provincesMap)
      ? provincesMap
      : Object.values(provincesMap);
    return list.filter(
      (p) =>
        CountryRegistry.resolveCanonicalId(p.ownerNationId) === canonicalId,
    );
  }

  public static getPopulation(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    let total = 0;
    for (let i = 0; i < provs.length; i++) {
      total += provs[i]!.population || 0;
    }
    return total;
  }

  public static getMaxPopulationCapacity(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    let total = 0;
    for (let i = 0; i < provs.length; i++) {
      total += provs[i]!.maxPopulationCapacity || 0;
    }
    return total;
  }

  public static getPerCapitaProductivity(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    if (provs.length === 0) return 5000;

    let totalPop = 0;
    let totalProdWeighted = 0;

    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]!;
      const pop = p.population || 0;
      totalPop += pop;
      totalProdWeighted += pop * (p.perCapitaProductivity || 5000);
    }

    if (totalPop <= 0) return 5000;
    return Math.round(totalProdWeighted / totalPop);
  }

  public static getInfrastructureLevel(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const prod = this.getPerCapitaProductivity(
      nationId,
      provincesMap,
      ownedProvinces,
      provincesByOwnerMap,
    );
    if (prod <= 5000) return 1;
    const ratio = prod / 5000;
    const level = Math.floor(Math.log(ratio + 1e-6) / Math.log(1.05)) + 1;
    return Math.max(1, level);
  }

  public static getTerritoryPixelCount(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    let total = 0;
    for (let i = 0; i < provs.length; i++) {
      total += provs[i]!.pixelCount || 0;
    }
    return total;
  }

  public static hasSeaAccess(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    for (let i = 0; i < provs.length; i++) {
      if (provs[i]!.hasSeaAccess) return true;
    }
    return false;
  }

  public static isAlive(
    nationId: string,
    provincesMap?: Record<string, Province> | Province[],
    ownedProvinces?: Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): boolean {
    const provs =
      ownedProvinces ??
      this.getOwnedProvinces(nationId, provincesMap, provincesByOwnerMap);

    for (let i = 0; i < provs.length; i++) {
      const p = provs[i]!;
      if ((p.pixelCount || 0) > 0 && (p.population || 0) > 0) return true;
    }
    return false;
  }

  public static calculateRankMap(
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province> | Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): Map<string, number> {
    if (!nationsMap) return new Map<string, number>();

    const aliveNations = Object.values(nationsMap).filter((n) => n.isAlive);
    if (aliveNations.length === 0) return new Map<string, number>();

    const ownerMap =
      provincesByOwnerMap ?? this.buildProvincesByOwnerMap(provincesMap);

    const candidatesInput: NationRankCandidateInput[] = new Array(
      aliveNations.length,
    );

    for (let i = 0; i < aliveNations.length; i++) {
      const nation = aliveNations[i]!;
      const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
      const provList =
        ownerMap.get(canonicalId) ?? ownerMap.get(nation.id) ?? [];

      let gdp = 0;
      let population = 0;
      for (let p = 0; p < provList.length; p++) {
        const prov = provList[p]!;
        gdp += getProvinceGdp(prov);
        population += prov.population || 0;
      }

      candidatesInput[i] = {
        id: nation.id,
        name: nation.name,
        gdp,
        population,
        military: nation.military,
        governmentType: nation.government.type,
        navalFleet: nation.navalFleet,
        stability: nation.government.stability,
        globalReputation: nation.globalReputation,
      };
    }

    return this.calculateRankMapFromCandidates(candidatesInput);
  }

  public static getRank(
    nationId: string,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province> | Province[],
    rankMap?: Map<string, number>,
  ): number {
    const canonicalId = CountryRegistry.resolveCanonicalId(nationId);
    if (rankMap) {
      return rankMap.get(canonicalId) ?? rankMap.get(nationId) ?? 99;
    }
    const map = this.calculateRankMap(nationsMap, provincesMap);
    return map.get(canonicalId) ?? map.get(nationId) ?? 99;
  }
}
