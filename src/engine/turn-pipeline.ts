import type { GameState } from "@/domain/game/game-state.schema";
import { SeededRandom } from "@/domain/shared/seeded-random";
import { deepClone } from "@/domain/shared/deep-clone";
import { TurnPhase, PipelineContext } from "@/engine/pipeline/turn-phase";
import { ModifiersPhase } from "@/engine/pipeline/modifiers-phase";
import { EconomyPhase } from "@/engine/pipeline/economy-phase";
import { MilitaryPhase } from "@/engine/pipeline/military-phase";
import { PoliticsPhase } from "@/engine/pipeline/politics-phase";
import { DiplomacyPhase } from "@/engine/pipeline/diplomacy-phase";
import { EventsPhase } from "@/engine/pipeline/events-phase";

export class TurnPipeline {
  private phases: { name: string; phase: TurnPhase }[];

  constructor(phases?: TurnPhase[]) {
    if (phases) {
      this.phases = phases.map((p) => ({
        name: p.constructor.name,
        phase: p,
      }));
    } else {
      this.phases = [
        { name: "ModifiersPhase", phase: new ModifiersPhase() },
        { name: "EconomyPhase", phase: new EconomyPhase() },
        { name: "MilitaryPhase", phase: new MilitaryPhase() },
        { name: "PoliticsPhase", phase: new PoliticsPhase() },
        { name: "DiplomacyPhase", phase: new DiplomacyPhase() },
        { name: "EventsPhase", phase: new EventsPhase() },
      ];
    }
  }

  public processTurn(state: GameState, prng: SeededRandom): GameState {
    const t0 = performance.now();
    const nextState = deepClone(state);
    const context: PipelineContext = {
      state: nextState,
      prng,
    };

    const phaseTimes: string[] = [];

    for (const item of this.phases) {
      const tpStart = performance.now();
      context.state = item.phase.execute(context);
      const tpDuration = performance.now() - tpStart;
      phaseTimes.push(`${item.name}: ${tpDuration.toFixed(2)}ms`);
    }

    const totalPipeline = performance.now() - t0;
    console.log(
      `[PIPELINE TIMING] Total: ${totalPipeline.toFixed(2)}ms | ${phaseTimes.join(" | ")}`,
    );

    return context.state;
  }
}
