import type { GameState } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { DiplomaticTurnProcessor } from "@/engine/pipeline/diplomatic-turn-processor";
import { EconomyTurnProcessor } from "@/engine/pipeline/economy-turn-processor";
import { PoliticsTurnProcessor } from "@/engine/pipeline/politics-turn-processor";
import { NationGettersUtility } from "@geopolitics/domain";

export class TurnPipeline {
  public processTurn(state: GameState): GameState {
    const currentState =
      DiplomaticTurnProcessor.processPendingProposalsForAi(state);

    const updatedNations: Record<string, Nation> = {};
    const updatedProvincesMap: Record<string, Province> = {
      ...currentState.provinces,
    };
    const provincesByOwner = new Map<string, Province[]>();

    for (const prov of Object.values(currentState.provinces || {})) {
      const canonicalOwner = CountryRegistry.resolveCanonicalId(
        prov.ownerNationId,
      );
      let list = provincesByOwner.get(canonicalOwner);
      if (!list) {
        list = [];
        provincesByOwner.set(canonicalOwner, list);
      }
      list.push(prov);
    }

    const nationKeys = Object.keys(currentState.nations);

    for (let i = 0; i < nationKeys.length; i++) {
      const id = nationKeys[i]!;
      const nation = currentState.nations[id];
      if (!nation) continue;

      const canonicalId = CountryRegistry.resolveCanonicalId(id);
      const isAlive = NationGettersUtility.isAlive(
        canonicalId,
        updatedProvincesMap,
      );

      if (!isAlive || !nation.isAlive) {
        updatedNations[id] = {
          ...nation,
          isAlive: false,
        };
        continue;
      }

      const ownedProvinces = provincesByOwner.get(canonicalId) || [];

      const { updatedNation: dipNation, isAtWar } =
        DiplomaticTurnProcessor.process(
          nation,
          currentState.nations,
          updatedProvincesMap,
        );

      const { updatedNation: ecoNation, updatedProvinces } =
        EconomyTurnProcessor.process(
          dipNation,
          currentState.nations,
          ownedProvinces,
          updatedProvincesMap,
        );

      for (let p = 0; p < updatedProvinces.length; p++) {
        const up = updatedProvinces[p]!;
        updatedProvincesMap[up.provinceId.toString()] = up;
      }

      const polNation = PoliticsTurnProcessor.process(
        ecoNation,
        currentState.nations,
        isAtWar,
        updatedProvincesMap,
      );

      updatedNations[id] = polNation;
    }

    return {
      ...currentState,
      provinces: updatedProvincesMap,
      nations: updatedNations,
    };
  }
}
