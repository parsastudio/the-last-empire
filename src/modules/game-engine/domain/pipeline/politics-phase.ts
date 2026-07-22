import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { StabilityCalculator } from "@/modules/politics/domain/stability-calculator";
import { CorruptionManager } from "@/modules/politics/domain/corruption-manager";
import { RebellionEngine } from "@/modules/politics/domain/rebellion-engine";
import { MilitaryCoupEngine } from "@/modules/politics/domain/military-coup-engine";
import { ElectionEngine } from "@/modules/politics/domain/election-engine";
import { TraitManager } from "@/modules/nation/domain/trait-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export interface PoliticsEngines {
  stabilityCalc: StabilityCalculator;
  corruptionManager: CorruptionManager;
  rebellionEngine: RebellionEngine;
  coupEngine: MilitaryCoupEngine;
  electionEngine: ElectionEngine;
  traitManager: TraitManager;
}

export class PoliticsPhase implements TurnPhase {
  private engines: PoliticsEngines;

  constructor(engines?: PoliticsEngines) {
    this.engines = engines ?? {
      stabilityCalc: new StabilityCalculator(),
      corruptionManager: new CorruptionManager(),
      rebellionEngine: new RebellionEngine(),
      coupEngine: new MilitaryCoupEngine(),
      electionEngine: new ElectionEngine(),
      traitManager: new TraitManager(),
    };
  }

  public execute(context: PipelineContext): GameState {
    const nextState = { ...context.state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = {
        ...nation,
        government: {
          ...nation.government,
        },
      };

      updated.government.corruption =
        this.engines.corruptionManager.updateCorruptionLevel(updated);

      let stability =
        this.engines.stabilityCalc.calculateTurnStability(updated);
      stability = Math.max(
        0,
        Math.min(
          100,
          stability + this.engines.traitManager.getBaseStabilityDelta(updated),
        ),
      );
      updated.government.stability = stability;

      const electionResult = this.engines.electionEngine.processElection(
        updated,
        nextState.currentTurn,
        context.prng.nextInt(1, 1000000),
      );
      if (electionResult.electionHeld) {
        updated = electionResult.updatedNation;
      }

      const rebellionResult =
        this.engines.rebellionEngine.checkAndTriggerRebellion(updated);
      if (rebellionResult.hasRebellionTriggered) {
        updated = rebellionResult.updatedNation;
      }

      const coupResult = this.engines.coupEngine.checkAndExecuteCoup(updated);
      if (coupResult.hasCoupOccurred) {
        updated = coupResult.updatedNation;
      }

      updated.government = {
        ...updated.government,
        turnsInPower: updated.government.turnsInPower + 1,
      };

      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
