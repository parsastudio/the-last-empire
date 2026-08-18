import type { GameState } from "@/domain/game/game-state.schema";
import { MigrationEngine } from "@/engine/economy/demographics/migration-engine";
import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { RankManager } from "@/engine/politics/rank-manager";
import { NationGeographySyncer } from "@/engine/pipeline/nation-geography-syncer";
import { DiplomaticTurnProcessor } from "@/engine/pipeline/diplomatic-turn-processor";
import { EconomyTurnProcessor } from "@/engine/pipeline/economy-turn-processor";
import { PoliticsTurnProcessor } from "@/engine/pipeline/politics-turn-processor";

export class TurnPipeline {
  public processTurn(state: GameState): GameState {
    const currentState =
      DiplomaticTurnProcessor.processPendingProposalsForAi(state);

    const updatedNations: Record<string, Nation> = {};
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
      const ownedProvinces = provincesByOwner.get(canonicalId) || [];

      const { isAlive, syncedNation } = NationGeographySyncer.sync(
        nation,
        ownedProvinces,
      );

      if (!isAlive) {
        updatedNations[id] = syncedNation;
        continue;
      }

      const { updatedNation: dipNation, isAtWar } =
        DiplomaticTurnProcessor.process(syncedNation, currentState.nations);

      const ecoNation = EconomyTurnProcessor.process(
        dipNation,
        currentState.nations,
      );

      const polNation = PoliticsTurnProcessor.process(
        ecoNation,
        currentState.nations,
        isAtWar,
      );

      updatedNations[id] = polNation;
    }

    const migrationSummary =
      MigrationEngine.processGlobalMigration(updatedNations);
    const rankedNations = RankManager.recalculateRanks(
      migrationSummary.updatedNations,
    );

    return {
      ...currentState,
      nations: rankedNations,
    };
  }
}
