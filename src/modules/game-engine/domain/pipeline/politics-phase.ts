import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import { StabilityCalculator } from "@/modules/politics/domain/stability-calculator";
import { CorruptionManager } from "@/modules/politics/domain/corruption-manager";
import { ElectionEngine } from "@/modules/politics/domain/election-engine";
import { TraitManager } from "@/modules/nation/domain/trait-manager";
import { DomesticCrisisManager } from "@/modules/politics/domain/domestic-crisis-manager";
import { ProxyWarManager } from "@/modules/politics/domain/proxy-war-manager";
import { TurnPhase, PipelineContext } from "./turn-phase";

export interface PoliticsEngines {
  stabilityCalc: StabilityCalculator;
  corruptionManager: CorruptionManager;
  domesticCrisisManager: DomesticCrisisManager;
  electionEngine: ElectionEngine;
  traitManager: TraitManager;
}

export class PoliticsPhase implements TurnPhase {
  private engines: PoliticsEngines;
  private proxyManager = new ProxyWarManager();

  constructor(engines?: PoliticsEngines) {
    this.engines = engines ?? {
      stabilityCalc: new StabilityCalculator(),
      corruptionManager: new CorruptionManager(),
      domesticCrisisManager: new DomesticCrisisManager(),
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

      let accumulatedProxyBudget = 0;
      for (const other of Object.values(nations)) {
        if (other.isAlive && other.id !== id) {
          accumulatedProxyBudget += other.proxyInfluenceBudget[id] || 0;
        }
      }

      const proxyResult = this.proxyManager.processTurnProxyImpact(
        updated,
        accumulatedProxyBudget,
      );
      updated = proxyResult.updatedTargetNation;

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

      const crisisResult =
        this.engines.domesticCrisisManager.checkAndProcessCrisis(updated);
      updated = crisisResult.updatedNation;

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
