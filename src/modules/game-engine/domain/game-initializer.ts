import type {
  Nation,
  NationTrait,
} from "@/modules/nation/schemas/nation.schema";
import { SeededRandom } from "@/core/math/seeded-random";

export class GameInitializer {
  private traitsList: NationTrait[] = [
    "OIL_RICH",
    "ISLAND_FORTRESS",
    "MILITARISTIC",
    "FRAGILE_ECONOMY",
    "INDUSTRIAL_HUB",
    "ISOLATED_SOCIETY",
  ];

  public assignDeterministicTraits(
    nations: Record<string, Nation>,
    prng: SeededRandom,
  ): Record<string, Nation> {
    const updated = { ...nations };

    for (const [id, nation] of Object.entries(updated)) {
      const traitIndex1 = prng.nextInt(0, this.traitsList.length - 1);
      let traitIndex2 = prng.nextInt(0, this.traitsList.length - 1);

      while (traitIndex1 === traitIndex2) {
        traitIndex2 = prng.nextInt(0, this.traitsList.length - 1);
      }

      const assignedTraits: NationTrait[] = [];
      const trait1 = this.traitsList[traitIndex1];
      const trait2 = this.traitsList[traitIndex2];

      if (trait1) {
        assignedTraits.push(trait1);
      }
      if (trait2) {
        assignedTraits.push(trait2);
      }

      const updatedRelations = { ...nation.relations };
      for (const [targetId, relation] of Object.entries(updatedRelations)) {
        updatedRelations[targetId] = {
          ...relation,
          trust: 0,
          tension: 0,
          spyNetworkStrength: 0,
          intelLevel: 0,
        };
      }

      updated[id] = {
        ...nation,
        traits: assignedTraits,
        relations: updatedRelations,
      };
    }

    return updated;
  }
}
