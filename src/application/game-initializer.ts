import type {
  Nation,
  NationTrait,
} from "@/domain/nation/nation.schema";
import { SeededRandom } from "@/domain/shared/seeded-random";

export interface AbstractProfile {
  name: string;
  flagCode: string;
  gdp: number;
  population: number;
  territorySize: number;
  traits: NationTrait[];
  oil: number;
  steel: number;
  treasury: number;
}

export class GameInitializer {
  private traitsList: NationTrait[] = [
    "OIL_RICH",
    "ISLAND_FORTRESS",
    "MILITARISTIC",
    "FRAGILE_ECONOMY",
    "INDUSTRIAL_HUB",
    "ISOLATED_SOCIETY",
  ];

  private profiles: Record<string, AbstractProfile> = {
    TIER_1: {
      name: "Industrial Superpower",
      flagCode: "ISP",
      gdp: 20000000,
      population: 300000000,
      territorySize: 9000,
      traits: ["INDUSTRIAL_HUB", "MILITARISTIC"],
      oil: 1000,
      steel: 2000,
      treasury: 500000,
    },
    TIER_2: {
      name: "Resource Hub",
      flagCode: "RHB",
      gdp: 10000000,
      population: 150000000,
      territorySize: 5000,
      traits: ["OIL_RICH"],
      oil: 5000,
      steel: 1000,
      treasury: 300000,
    },
    TIER_3: {
      name: "Emerging Market",
      flagCode: "EMR",
      gdp: 5000000,
      population: 80000000,
      territorySize: 3000,
      traits: ["FRAGILE_ECONOMY"],
      oil: 500,
      steel: 500,
      treasury: 100000,
    },
  };

  public assignDeterministicTraits(
    nations: Record<string, Nation>,
    prng: SeededRandom,
  ): Record<string, Nation> {
    const updated = { ...nations };
    const tierKeys = Object.keys(this.profiles);
    let index = 0;
    for (const [id, nation] of Object.entries(updated)) {
      const assignedTier = tierKeys[index % tierKeys.length];
      const profile = this.profiles[assignedTier];
      index++;
      let assignedTraits: NationTrait[] = [];
      let nextGdp = nation.gdp;
      let nextPopulation = nation.population;
      let nextTerritory = nation.geography.territorySize;
      let nextFlag = nation.flagCode;
      let nextName = nation.name;
      let nextOil = nation.resources.oil;
      let nextSteel = nation.resources.steel;
      let nextTreasury = nation.treasury;
      if (profile) {
        assignedTraits = [...profile.traits];
        nextGdp = profile.gdp;
        nextPopulation = profile.population;
        nextTerritory = profile.territorySize;
        nextFlag = profile.flagCode;
        nextName = profile.name;
        nextOil = profile.oil;
        nextSteel = profile.steel;
        nextTreasury = profile.treasury;
      } else {
        const traitIndex1 = prng.nextInt(0, this.traitsList.length - 1);
        let traitIndex2 = prng.nextInt(0, this.traitsList.length - 1);
        while (traitIndex1 === traitIndex2) {
          traitIndex2 = prng.nextInt(0, this.traitsList.length - 1);
        }
        const trait1 = this.traitsList[traitIndex1];
        const trait2 = this.traitsList[traitIndex2];
        if (trait1) {
          assignedTraits.push(trait1);
        }
        if (trait2) {
          assignedTraits.push(trait2);
        }
      }
      const updatedRelations = { ...nation.relations };
      for (const [targetId, relation] of Object.entries(updatedRelations)) {
        updatedRelations[targetId] = {
          ...relation,
          opinion: 0,
          coolOffTurnsRemaining: 0,
          intelLevel: 0,
        };
      }
      updated[id] = {
        ...nation,
        name: nextName,
        flagCode: nextFlag,
        gdp: nextGdp,
        population: nextPopulation,
        treasury: nextTreasury,
        traits: assignedTraits,
        relations: updatedRelations,
        resources: {
          ...nation.resources,
          oil: nextOil,
          steel: nextSteel,
        },
        geography: {
          ...nation.geography,
          territorySize: nextTerritory,
          contiguousMainlandSize: nextTerritory,
          isolatedPockets: [],
        },
        globalReputation: 0,
        globalAggression: 0,
        doctrines: {
          doctrinePoints: 0,
          unlockedDoctrines: [],
        },
        proxyInfluenceBudget: {},
      };
    }
    return updated;
  }
}
