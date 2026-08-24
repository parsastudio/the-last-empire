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
    const pipeStart = performance.now();

    const propStart = performance.now();
    const currentState =
      DiplomaticTurnProcessor.processPendingProposalsForAi(state);
    const propDuration = (performance.now() - propStart).toFixed(2);

    const updatedNations: Record<string, Nation> = {};
    const updatedProvincesMap: Record<string, Province> = {
      ...currentState.provinces,
    };
    const provincesByOwner = new Map<string, Province[]>();

    const groupStart = performance.now();
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
    const groupDuration = (performance.now() - groupStart).toFixed(2);

    const nationKeys = Object.keys(currentState.nations);

    let totalDipDuration = 0;
    let totalEcoDuration = 0;
    let totalPolDuration = 0;

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

      const dipStart = performance.now();
      const { updatedNation: dipNation, isAtWar } =
        DiplomaticTurnProcessor.process(
          nation,
          currentState.nations,
          updatedProvincesMap,
        );
      totalDipDuration += performance.now() - dipStart;

      const ecoStart = performance.now();
      const { updatedNation: ecoNation, updatedProvinces } =
        EconomyTurnProcessor.process(
          dipNation,
          currentState.nations,
          ownedProvinces,
          updatedProvincesMap,
        );
      totalEcoDuration += performance.now() - ecoStart;

      for (let p = 0; p < updatedProvinces.length; p++) {
        const up = updatedProvinces[p]!;
        updatedProvincesMap[up.provinceId.toString()] = up;
      }

      const polStart = performance.now();
      const polNation = PoliticsTurnProcessor.process(
        ecoNation,
        currentState.nations,
        isAtWar,
        updatedProvincesMap,
      );
      totalPolDuration += performance.now() - polStart;

      updatedNations[id] = polNation;
    }

    const totalPipeDuration = (performance.now() - pipeStart).toFixed(2);
    console.log(
      `[PIPELINE_METRICS] زمان کل پایپلاین: ${totalPipeDuration}ms [پروپوزال‌ها: ${propDuration}ms | گروه‌بندی استان‌ها: ${groupDuration}ms | دیپلماسی کل: ${totalDipDuration.toFixed(2)}ms | اقتصاد کل: ${totalEcoDuration.toFixed(2)}ms | سیاست کل: ${totalPolDuration.toFixed(2)}ms]`,
    );

    return {
      ...currentState,
      provinces: updatedProvincesMap,
      nations: updatedNations,
    };
  }
}
