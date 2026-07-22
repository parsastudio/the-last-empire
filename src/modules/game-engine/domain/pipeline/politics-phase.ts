import type { GameState } from "@/core/types/game-state.types";
import { StabilityCalculator } from "@/modules/politics/domain/stability-calculator";
import { CorruptionManager } from "@/modules/politics/domain/corruption-manager";
import { RebellionEngine } from "@/modules/politics/domain/rebellion-engine";
import { MilitaryCoupEngine } from "@/modules/politics/domain/military-coup-engine";
import { ElectionEngine } from "@/modules/politics/domain/election-engine";
import { TraitManager } from "@/modules/nation/domain/trait-manager";
import { TurnPhase } from "./turn-phase";

export class PoliticsPhase implements TurnPhase {
  private stabilityCalc = new StabilityCalculator();
  private corruptionManager = new CorruptionManager();
  private rebellionEngine = new RebellionEngine();
  private coupEngine = new MilitaryCoupEngine();
  private electionEngine = new ElectionEngine();
  private traitManager = new TraitManager();

  public execute(state: GameState): GameState {
    const nextState = { ...state };
    const nations = { ...nextState.nations };

    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      let updated = { ...nation };

      updated.government.corruption =
        this.corruptionManager.updateCorruptionLevel(updated);

      let stability = this.stabilityCalc.calculateTurnStability(updated);
      stability = Math.max(
        0,
        Math.min(
          100,
          stability + this.traitManager.getBaseStabilityDelta(updated),
        ),
      );
      updated.government.stability = stability;

      const electionResult = this.electionEngine.processElection(
        updated,
        nextState.currentTurn,
        nextState.seed,
      );
      if (electionResult.electionHeld) {
        updated = electionResult.updatedNation;
      }

      const rebellionResult =
        this.rebellionEngine.checkAndTriggerRebellion(updated);
      if (rebellionResult.hasRebellionTriggered) {
        updated = rebellionResult.updatedNation;
      }

      const coupResult = this.coupEngine.checkAndExecuteCoup(updated);
      if (coupResult.hasCoupOccurred) {
        updated = coupResult.updatedNation;
      }

      updated.government.turnsInPower += 1;
      nations[id] = updated;
    }

    nextState.nations = nations;
    return nextState;
  }
}
