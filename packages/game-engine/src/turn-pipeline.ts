import type { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { DiplomaticTurnProcessor } from "@/engine/pipeline/diplomatic-turn-processor";
import { EconomyTurnProcessor } from "@/engine/pipeline/economy-turn-processor";
import { PoliticsTurnProcessor } from "@/engine/pipeline/politics-turn-processor";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class TurnPipeline {
  public processTurn(state: GameState, turnContext: TurnContext): GameState {
    const currentState =
      DiplomaticTurnProcessor.processPendingProposalsForAi(state);

    const updatedNations: Record<string, Nation> = {};
    const updatedProvincesMap: Record<string, Province> = {
      ...currentState.provinces,
    };
    const economyLogs: TurnLogEntry[] = [];

    const nationKeys = Object.keys(currentState.nations);

    for (let i = 0; i < nationKeys.length; i++) {
      const id = nationKeys[i]!;
      const nation = currentState.nations[id];
      if (!nation) continue;

      const canonicalId = CountryRegistry.resolveCanonicalId(id);
      const ownedProvinces = turnContext.getOwnedProvinces(canonicalId);
      const hasTerritory = ownedProvinces.length > 0;

      if (!nation.isAlive || !hasTerritory) {
        updatedNations[canonicalId] = nation;
        continue;
      }

      const { updatedNation: dipNation, isAtWar } =
        DiplomaticTurnProcessor.process(nation, turnContext);

      const {
        updatedNation: ecoNation,
        updatedProvinces,
        bankruptcyLog,
      } = EconomyTurnProcessor.process(dipNation, turnContext);

      if (bankruptcyLog) {
        economyLogs.push(bankruptcyLog);
      }

      for (let p = 0; p < updatedProvinces.length; p++) {
        const up = updatedProvinces[p]!;
        updatedProvincesMap[up.provinceId.toString()] = up;
      }

      const polNation = PoliticsTurnProcessor.process(
        ecoNation,
        isAtWar,
        turnContext,
      );

      updatedNations[canonicalId] = polNation;
    }

    return {
      ...currentState,
      provinces: updatedProvincesMap,
      nations: updatedNations,
      turnLogs: [...currentState.turnLogs, ...economyLogs],
    };
  }
}
